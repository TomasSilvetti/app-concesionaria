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
    const desdeStr = searchParams.get("desde");
    const hastaStr = searchParams.get("hasta");

    if (!desdeStr || !hastaStr) {
      return NextResponse.json(
        { message: "Los parámetros 'desde' y 'hasta' son requeridos" },
        { status: 400 }
      );
    }

    const desde = new Date(desdeStr);
    const hasta = new Date(hastaStr);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return NextResponse.json(
        { message: "'desde' y 'hasta' deben ser fechas válidas en formato ISO" },
        { status: 400 }
      );
    }

    // Periodo anterior de igual duración
    const duracionMs = hasta.getTime() - desde.getTime();
    const anteriorHasta = new Date(desde.getTime() - 1);
    const anteriorDesde = new Date(anteriorHasta.getTime() - duracionMs);

    const [opsCerradas, todasOps, opsCerradasAnteriores, vehiculosStock, todasOpsConPagos] =
      await Promise.all([
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: "cerrada",
            fechaInicio: { gte: desde, lte: hasta },
          },
          select: {
            precioVentaTotal: true,
            ingresosNetos: true,
          },
        }),
        prisma.operation.count({
          where: {
            clienteId,
            fechaInicio: { gte: desde, lte: hasta },
          },
        }),
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: "cerrada",
            fechaInicio: { gte: anteriorDesde, lte: anteriorHasta },
          },
          select: { ingresosNetos: true },
        }),
        prisma.vehicle.findMany({
          where: {
            clienteId,
            operacionId: null,
            estado: { not: "vendido" },
            OperationExchange: {
              none: {
                Operation: { estado: "cerrada" },
              },
            },
          },
          select: { precioToma: true },
        }),
        prisma.operation.findMany({
          where: {
            clienteId,
            estado: { not: "cancelada" },
          },
          select: {
            precioVentaTotal: true,
            Pago: { select: { monto: true } },
          },
        }),
      ]);

    const gananciaNeta = opsCerradas.reduce((sum, op) => sum + op.ingresosNetos, 0);
    const gananciaPrevio = opsCerradasAnteriores.reduce((sum, op) => sum + op.ingresosNetos, 0);

    const gananciaDelta =
      gananciaPrevio !== 0
        ? parseFloat((((gananciaNeta - gananciaPrevio) / gananciaPrevio) * 100).toFixed(1))
        : null;

    const ticketPromedio =
      opsCerradas.length > 0
        ? opsCerradas.reduce((sum, op) => sum + op.precioVentaTotal, 0) / opsCerradas.length
        : 0;

    const tasaConversion =
      todasOps > 0
        ? parseFloat(((opsCerradas.length / todasOps) * 100).toFixed(1))
        : 0;

    const capitalStock = vehiculosStock.reduce(
      (sum, v) => sum + (v.precioToma ?? 0),
      0
    );

    const deudaPendiente = todasOpsConPagos.reduce((sum, op) => {
      const cobrado = op.Pago.reduce((s, p) => s + p.monto, 0);
      const saldo = op.precioVentaTotal - cobrado;
      return sum + (saldo > 0 ? saldo : 0);
    }, 0);

    return NextResponse.json(
      {
        gananciaNeta,
        gananciaDelta,
        ticketPromedio,
        tasaConversion,
        capitalStock,
        deudaPendiente,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al calcular KPIs:", error);
    return NextResponse.json({ message: "Error al calcular KPIs" }, { status: 500 });
  }
}
