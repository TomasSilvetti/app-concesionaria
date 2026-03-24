import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pagoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id, pagoId } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
      select: { id: true, precioVentaTotal: true, estado: true },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const existing = await prisma.pago.findFirst({
      where: { id: pagoId, operacionId: operation.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "Pago no encontrado" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.pago.delete({ where: { id: pagoId } });

      const aggregate = await tx.pago.aggregate({
        where: { operacionId: operation.id },
        _sum: { monto: true },
      });
      const saldado = aggregate._sum.monto ?? 0;
      const pendiente = Math.max(operation.precioVentaTotal - saldado, 0);

      let nuevoEstado = operation.estado;
      if (operation.estado === "cerrada" && pendiente > 0) {
        nuevoEstado = "open";
        await tx.operation.update({
          where: { id: operation.id },
          data: { estado: nuevoEstado, actualizadoEn: new Date() },
        });
      }

      return { saldado, pendiente, estado: nuevoEstado };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return NextResponse.json({ message: "Error al eliminar pago" }, { status: 500 });
  }
}
