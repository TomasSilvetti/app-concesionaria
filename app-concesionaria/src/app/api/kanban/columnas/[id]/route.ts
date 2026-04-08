import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const columna = await prisma.kanbanColumna.findUnique({
      where: { id },
      select: { id: true, clienteId: true },
    });

    if (!columna) {
      return NextResponse.json(
        { message: "Columna no encontrada" },
        { status: 404 }
      );
    }

    if (columna.clienteId !== clienteId) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Cuerpo JSON inválido" },
        { status: 400 }
      );
    }

    const { nombre } = body as { nombre?: unknown };

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { message: "El nombre de la columna es requerido" },
        { status: 400 }
      );
    }

    const actualizada = await prisma.kanbanColumna.update({
      where: { id },
      data: { nombre: nombre.trim() },
    });

    return NextResponse.json({ columna: actualizada });
  } catch (error) {
    console.error("Error al renombrar columna:", error);
    return NextResponse.json(
      { message: "Error al renombrar columna" },
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

    const { id } = await params;

    const columna = await prisma.kanbanColumna.findUnique({
      where: { id },
      select: { id: true, clienteId: true, _count: { select: { tarjetas: true } } },
    });

    if (!columna) {
      return NextResponse.json(
        { message: "Columna no encontrada" },
        { status: 404 }
      );
    }

    if (columna.clienteId !== clienteId) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    await prisma.kanbanColumna.delete({ where: { id } });

    return NextResponse.json({
      message: "Columna eliminada",
      tarjetasEliminadas: columna._count.tarjetas,
    });
  } catch (error) {
    console.error("Error al eliminar columna:", error);
    return NextResponse.json(
      { message: "Error al eliminar columna" },
      { status: 500 }
    );
  }
}
