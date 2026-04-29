import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Migración puntual: restaura vehículos en_proceso de operaciones canceladas
export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const now = new Date();

  // Vehículos principales de operaciones cerradas → marcar como vendido
  const closedOps = await prisma.operation.findMany({
    where: { estado: "cerrada" },
    select: { vehiculoVendidoId: true },
  });

  const soldIds = closedOps.map((op) => op.vehiculoVendidoId);
  const soldResult = soldIds.length > 0
    ? await prisma.vehicle.updateMany({
        where: { id: { in: soldIds }, estado: { not: "vendido" } },
        data: { estado: "vendido", actualizadoEn: now },
      })
    : { count: 0 };

  // Vehículos principales de operaciones canceladas → restaurar a disponible
  const cancelledOps = await prisma.operation.findMany({
    where: { estado: "cancelada", tipoOperacion: "Venta desde stock" },
    select: { vehiculoVendidoId: true },
  });

  // Vehículos de intercambio de operaciones canceladas → restaurar a disponible
  const cancelledExchanges = await prisma.operationExchange.findMany({
    where: { Operation: { estado: "cancelada" } },
    select: { stockId: true },
  });

  const restoreIds = [
    ...cancelledOps.map((op) => op.vehiculoVendidoId),
    ...cancelledExchanges.map((ex) => ex.stockId),
  ];

  const restoreResult = restoreIds.length > 0
    ? await prisma.vehicle.updateMany({
        where: { id: { in: restoreIds }, estado: "en_proceso" },
        data: { estado: "disponible", actualizadoEn: now },
      })
    : { count: 0 };

  return NextResponse.json({
    message: "Migración completada",
    vendidos: soldResult.count,
    restaurados: restoreResult.count,
  });
}
