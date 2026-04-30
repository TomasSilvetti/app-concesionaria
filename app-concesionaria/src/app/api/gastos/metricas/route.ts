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
    hasta.setUTCHours(23, 59, 59, 999);

    const [pagosResult, pagosCerradas, pagosAbiertas, gastosResult, ingresosResult, plataPorCobrarResult, ops0km, vehiculosStock, pagosDetalleCerradas, pagosDetalleAbiertas, gastosDetalle, ingresosDetalle, ops0kmDetalle, vehiculosStockDetalle] =
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

        // SUM de gastos directos del período (solo tipo "gasto")
        prisma.expense.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "gasto",
          },
          _sum: { monto: true },
        }),

        // SUM de ingresos extraordinarios del período (solo tipo "ingreso")
        prisma.expense.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "ingreso",
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

        // Precio de toma de operaciones 0km cerradas en el período (solo se gasta al cerrar)
        prisma.operation.findMany({
          where: {
            clienteId,
            tipoOperacion: { not: "Venta desde stock" },
            estado: "cerrada",
            fechaVenta: { gte: desde, lte: hasta },
            precioToma: { not: null },
          },
          select: { precioToma: true },
        }),

        // Precio de toma de vehículos de stock vendidos con operación cerrada en el período
        prisma.vehicle.findMany({
          where: {
            clienteId,
            operacionId: null,
            OperacionesVenta: {
              some: { estado: "cerrada", fechaVenta: { gte: desde, lte: hasta } },
            },
            precioToma: { not: null },
          },
          select: { precioToma: true },
        }),

        // Detalle de pagos de operaciones cerradas
        prisma.pago.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            Operation: { estado: "cerrada" },
          },
          select: {
            id: true,
            monto: true,
            fecha: true,
            Operation: { select: { idOperacion: true, tipoOperacion: true, VehiculoVendido: { select: { modelo: true, anio: true, VehicleBrand: { select: { nombre: true } } } } } },
          },
          orderBy: { fecha: "desc" },
        }),

        // Detalle de pagos de operaciones abiertas
        prisma.pago.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            Operation: { estado: { in: ["abierta", "open"] } },
          },
          select: {
            id: true,
            monto: true,
            fecha: true,
            Operation: { select: { idOperacion: true, tipoOperacion: true, VehiculoVendido: { select: { modelo: true, anio: true, VehicleBrand: { select: { nombre: true } } } } } },
          },
          orderBy: { fecha: "desc" },
        }),

        // Detalle de gastos directos
        prisma.expense.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "gasto",
          },
          select: { id: true, descripcion: true, monto: true, fecha: true },
          orderBy: { fecha: "desc" },
        }),

        // Detalle de ingresos extraordinarios
        prisma.expense.findMany({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
            tipo: "ingreso",
          },
          select: { id: true, descripcion: true, monto: true, fecha: true },
          orderBy: { fecha: "desc" },
        }),

        // Detalle de operaciones 0km con precio de toma
        prisma.operation.findMany({
          where: {
            clienteId,
            tipoOperacion: { not: "Venta desde stock" },
            estado: "cerrada",
            fechaVenta: { gte: desde, lte: hasta },
            precioToma: { not: null },
          },
          select: { id: true, idOperacion: true, tipoOperacion: true, precioToma: true, fechaVenta: true, VehiculoVendido: { select: { modelo: true, anio: true, VehicleBrand: { select: { nombre: true } } } } },
          orderBy: { fechaVenta: "desc" },
        }),

        // Detalle de vehículos stock con precio de toma
        prisma.vehicle.findMany({
          where: {
            clienteId,
            operacionId: null,
            OperacionesVenta: {
              some: { estado: "cerrada", fechaVenta: { gte: desde, lte: hasta } },
            },
            precioToma: { not: null },
          },
          select: { id: true, modelo: true, anio: true, precioToma: true, VehicleBrand: { select: { nombre: true } } },
        }),
      ]);

    const totalPagos = pagosResult._sum.monto ?? 0;
    const vendidoBrutoCerradas = pagosCerradas._sum.monto ?? 0;
    const vendidoBrutoAbiertas = pagosAbiertas._sum.monto ?? 0;
    const vendidoBrutoOtros = totalPagos - vendidoBrutoCerradas - vendidoBrutoAbiertas;
    const gastosDirectos = gastosResult._sum.monto ?? 0;
    const totalIngresos = ingresosResult._sum.monto ?? 0;
    const totalVendidoBruto = totalPagos + totalIngresos;
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
        ingresosExtraordinarios: totalIngresos,
      },
      detalleTotalVendido: {
        cerradas: pagosDetalleCerradas.map((p) => {
          const veh = p.Operation?.VehiculoVendido;
          const vehiculoStr = veh ? `${veh.VehicleBrand.nombre} ${veh.modelo} ${veh.anio ?? ""}`.trim() : "";
          return {
            id: p.id,
            monto: p.monto,
            fecha: p.fecha,
            descripcion: p.Operation
              ? `${p.Operation.tipoOperacion} — ${vehiculoStr || `Op. ${p.Operation.idOperacion}`}`
              : "Sin operación",
          };
        }),
        abiertas: pagosDetalleAbiertas.map((p) => {
          const veh = p.Operation?.VehiculoVendido;
          const vehiculoStr = veh ? `${veh.VehicleBrand.nombre} ${veh.modelo} ${veh.anio ?? ""}`.trim() : "";
          return {
            id: p.id,
            monto: p.monto,
            fecha: p.fecha,
            descripcion: p.Operation
              ? `${p.Operation.tipoOperacion} — ${vehiculoStr || `Op. ${p.Operation.idOperacion}`}`
              : "Sin operación",
          };
        }),
        ingresosExtraordinarios: ingresosDetalle.map((e) => ({
          id: e.id,
          monto: e.monto,
          fecha: e.fecha,
          descripcion: e.descripcion ?? "Ingreso extraordinario",
        })),
      },
      totalGastado,
      totalGastos: gastosDirectos,
      totalIngresos,
      desgloseTotalGastado: {
        gastosDirectos,
        precioToma0km,
        precioTomaStock,
      },
      detalleTotalGastado: {
        gastosDirectos: gastosDetalle.map((e) => ({
          id: e.id,
          monto: e.monto,
          fecha: e.fecha,
          descripcion: e.descripcion ?? "Gasto directo",
        })),
        precioToma0km: ops0kmDetalle.map((op) => {
          const veh = op.VehiculoVendido;
          const vehiculoStr = veh ? `${veh.VehicleBrand.nombre} ${veh.modelo} ${veh.anio ?? ""}`.trim() : `Op. ${op.idOperacion}`;
          return {
            id: op.id,
            monto: op.precioToma ?? 0,
            fecha: op.fechaVenta,
            descripcion: vehiculoStr,
          };
        }),
        precioTomaStock: vehiculosStockDetalle.map((v) => ({
          id: v.id,
          monto: v.precioToma ?? 0,
          fecha: null,
          descripcion: `${v.VehicleBrand.nombre} ${v.modelo} ${v.anio ?? ""}`.trim(),
        })),
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
