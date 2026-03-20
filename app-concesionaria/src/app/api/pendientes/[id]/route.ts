import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.pendiente.findFirst({
      where: { id, clienteId: session.user.clienteId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pendiente no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { nombreCliente, detalle, completado } = body;

    if (nombreCliente !== undefined && !nombreCliente?.trim()) {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }
    if (detalle !== undefined && !detalle?.trim()) {
      return NextResponse.json(
        { error: "El detalle del auto es requerido" },
        { status: 400 }
      );
    }

    const updated = await prisma.pendiente.update({
      where: { id },
      data: {
        ...(nombreCliente !== undefined && { nombreCliente: nombreCliente.trim() }),
        ...(detalle !== undefined && { detalle: detalle.trim() }),
        ...(completado !== undefined && { completado }),
        actualizadoEn: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el pendiente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.pendiente.findFirst({
      where: { id, clienteId: session.user.clienteId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pendiente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.pendiente.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar el pendiente" },
      { status: 500 }
    );
  }
}
