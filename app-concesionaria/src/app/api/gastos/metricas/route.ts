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

    const [pagosResult, operacionesResult, gastosResult, plataPorCobrarResult] =
      await Promise.all([
        // SUM de monto de Pagos de TODAS las operaciones (abiertas y cerradas) en el período
        prisma.pago.aggregate({
          where: {
            clienteId,
            fecha: { gte: desde, lte: hasta },
          },
          _sum: {
            monto: true,
          },
        }),

        // SUM de precioToma de operaciones cerradas en el período (para cálculo de ganancia)
        prisma.operation.aggregate({
          where: {
            clienteId,
            estado: "cerrada",
            fechaVenta: { gte: desde, lte: hasta },
          },
          _sum: {
            precioToma: true,
          },
        }),

        // SUM de monto de gastos asociados a operaciones cerradas en el período
        prisma.expense.aggregate({
          where: {
            clienteId,
            Operation: {
              estado: "cerrada",
              fechaVenta: { gte: desde, lte: hasta },
            },
          },
          _sum: {
            monto: true,
          },
        }),

        // SUM de ingresosNetos de operaciones abiertas (sin filtro de período)
        prisma.operation.aggregate({
          where: {
            clienteId,
            estado: { in: ["abierta", "open"] },
          },
          _sum: {
            ingresosNetos: true,
          },
        }),
      ]);

    const totalVendidoBruto = pagosResult._sum.monto ?? 0;
    const totalPrecioDeToma = operacionesResult._sum.precioToma ?? 0;
    const totalGastado = gastosResult._sum.monto ?? 0;
    const ganancia = totalVendidoBruto - totalPrecioDeToma - totalGastado;
    const plataPorCobrar = plataPorCobrarResult._sum.ingresosNetos ?? 0;

    return NextResponse.json({
      totalVendidoBruto,
      totalPrecioDeToma,
      totalGastado,
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
