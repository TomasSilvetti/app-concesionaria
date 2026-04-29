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

    // Incluir hasta el final del día de 'hasta'
    hasta.setHours(23, 59, 59, 999);

    const [pagosResult, pagosCerradas, pagosAbiertas, gastosResult, plataPorCobrarResult, ops0km, vehiculosStock] =
      await Promise.all([
        // SUM de monto de Pagos de TODAS las operaciones en el período
        prisma.pago.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
          },
          _sum: { monto: true },
        }),

        // SUM de pagos de operaciones cerradas en el período
        prisma.pago.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            Operation: { estado: "cerrada" },
          },
          _sum: { monto: true },
        }),

        // SUM de pagos de operaciones abiertas en el período
        prisma.pago.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            Operation: { estado: { in: ["abierta", "open"] } },
          },
          _sum: { monto: true },
        }),

        // SUM de monto de todos los gastos del período (con o sin operación, cualquier estado)
        prisma.expense.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
          },
          _sum: { monto: true },
        }),

        // Operaciones abiertas con sus pagos para calcular saldo pendiente de cobro
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: { in: ["abierta", "open"] },
          },
          select: {
            precioVentaTotal: true,
            Pago: { select: { monto: true } },
          },
        }),

        // Precio de toma de operaciones 0km abiertas/cerradas (no canceladas) en el período
        prisma.operation.findMany({
          where: {
            clienteId,
            tipoOperacion: { not: "Venta desde stock" },
            estado: { not: "cancelada" },
            fechaInicio: { gte: desde, lte: hasta },
            precioToma: { not: null },
          },
          select: { precioToma: true },
        }),

        // Precio de toma de vehículos de stock ingresados en el período (deduplicado automáticamente)
        prisma.vehicle.findMany({
          where: {
            clienteId,
            operacionId: null,
            creadoEn: { gte: desde, lte: hasta },
            precioToma: { not: null },
          },
          select: { precioToma: true },
        }),
      ]);

    const totalVendidoBruto = pagosResult._sum.monto ?? 0;
    const vendidoBrutoCerradas = pagosCerradas._sum.monto ?? 0;
    const vendidoBrutoAbiertas = pagosAbiertas._sum.monto ?? 0;
    const vendidoBrutoOtros = totalVendidoBruto - vendidoBrutoCerradas - vendidoBrutoAbiertas;
    const gastosDirectos = gastosResult._sum.monto ?? 0;
    const precioToma0km = ops0km.reduce((sum, op) => sum + (op.precioToma ?? 0), 0);
    const precioTomaStock = vehiculosStock.reduce((sum, v) => sum + (v.precioToma ?? 0), 0);
    const totalGastado = gastosDirectos + precioToma0km + precioTomaStock;

    const ganancia = totalVendidoBruto - totalGastado;
    const plataPorCobrar = plataPorCobrarResult.reduce((sum, op) => {
      const pagado = op.Pago.reduce((s, p) => s + p.monto, 0);
      return sum + Math.max(op.precioVentaTotal - pagado, 0);
    }, 0);

    return NextResponse.json({
      totalVendidoBruto,
      desgloseTotalVendido: {
        cerradas: vendidoBrutoCerradas,
        abiertas: vendidoBrutoAbiertas,
        canceladas: vendidoBrutoOtros,
      },
      totalGastado,
      desgloseTotalGastado: {
        gastosDirectos,
        precioToma0km,
        precioTomaStock,
      },
      ganancia,
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
