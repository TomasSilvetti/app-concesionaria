import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    if (!desdeParam || !hastaParam) {
      return NextResponse.json(
        { message: "Los parámetros 'desde' y 'hasta' son requeridos" },
        { status: 400 }
      );
    }

    const desde = new Date(desdeParam);
    const hasta = new Date(hastaParam);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return NextResponse.json(
        { message: "Formato de fecha inválido. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    hasta.setUTCHours(23, 59, 59, 999);

    const [operacionesCerradas, gastosResult, ingresosResult, plataPorCobrarResult, gastosDetalle, ingresosDetalle] =
      await Promise.all([
        // Operaciones cerradas en el período — base del ingreso neto de la caja
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: "cerrada",
            fechaVenta: { gte: desde, lte: hasta },
          },
          select: {
            id: true,
            idOperacion: true,
            precioVentaTotal: true,
            precioToma: true,
            fechaVenta: true,
            tipoOperacion: true,
            VehiculoVendido: {
              select: {
                modelo: true,
                anio: true,
                VehicleBrand: { select: { nombre: true } },
              },
            },
          },
          orderBy: { fechaVenta: "desc" },
        }),

        // Egresos pagados desde la caja empresa
        prisma.expense.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "gasto",
            Origin: { nombre: "Caja Empresa" },
          },
          _sum: { monto: true },
        }),

        // Ingresos extraordinarios cobrados por la caja empresa
        prisma.expense.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "ingreso",
            Origin: { nombre: "Caja Empresa" },
          },
          _sum: { monto: true },
        }),

        // Operaciones abiertas para calcular plata por cobrar
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: { in: ["abierta", "open"] },
          },
          select: {
            precioVentaTotal: true,
            precioToma: true,
            Pago: { select: { monto: true } },
          },
        }),

        // Detalle de egresos pagados desde la caja empresa
        prisma.expense.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "gasto",
            Origin: { nombre: "Caja Empresa" },
          },
          select: { id: true, descripcion: true, monto: true, fecha: true },
          orderBy: { fecha: "desc" },
        }),

        // Detalle de ingresos extraordinarios cobrados por la caja empresa
        prisma.expense.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "ingreso",
            Origin: { nombre: "Caja Empresa" },
          },
          select: { id: true, descripcion: true, monto: true, fecha: true },
          orderBy: { fecha: "desc" },
        }),
      ]);

    // Ingreso neto por operación = precioVentaTotal - precioToma
    // La toma es un crédito al cliente, no plata que entró a la caja
    const ingresosPorOps = operacionesCerradas.reduce(
      (sum, op) => sum + op.precioVentaTotal - (op.precioToma ?? 0),
      0
    );
    const ingresosExtraordinarios = ingresosResult._sum.monto ?? 0;
    const egresos = gastosResult._sum.monto ?? 0;

    const cajaDinero = ingresosPorOps + ingresosExtraordinarios - egresos;

    // Plata por cobrar: diferencia entre precio neto y lo ya cobrado en ops abiertas
    const plataPorCobrar = plataPorCobrarResult.reduce((sum, op) => {
      const precioNeto = op.precioVentaTotal - (op.precioToma ?? 0);
      const pagado = op.Pago.reduce((s, p) => s + p.monto, 0);
      return sum + Math.max(precioNeto - pagado, 0);
    }, 0);

    return NextResponse.json({
      cajaDinero,
      desgloseCaja: {
        ingresosPorOps,
        ingresosExtraordinarios,
        egresos,
      },
      detalleCaja: {
        operacionesCerradas: operacionesCerradas.map((op) => {
          const veh = op.VehiculoVendido;
          const vehiculoStr = veh
            ? `${veh.VehicleBrand.nombre} ${veh.modelo} ${veh.anio ?? ""}`.trim()
            : `Op. ${op.idOperacion}`;
          const neto = op.precioVentaTotal - (op.precioToma ?? 0);
          return {
            id: op.id,
            descripcion: `${op.tipoOperacion} — ${vehiculoStr}`,
            precioVenta: op.precioVentaTotal,
            precioToma: op.precioToma ?? 0,
            neto,
            fecha: op.fechaVenta,
          };
        }),
        ingresosExtraordinarios: ingresosDetalle.map((e) => ({
          id: e.id,
          descripcion: e.descripcion ?? "Ingreso extraordinario",
          monto: e.monto,
          fecha: e.fecha,
        })),
        egresos: gastosDetalle.map((e) => ({
          id: e.id,
          descripcion: e.descripcion ?? "Gasto directo",
          monto: e.monto,
          fecha: e.fecha,
        })),
      },
      plataPorCobrar,
    });
  } catch (error) {
    console.error("Error al obtener métricas de gastos:", error);
    return NextResponse.json(
      { message: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}
