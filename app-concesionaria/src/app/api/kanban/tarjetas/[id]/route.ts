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

    const tarjeta = await prisma.kanbanTarjeta.findUnique({
      where: { id },
      select: { id: true, clienteId: true },
    });

    if (!tarjeta) {
      return NextResponse.json(
        { message: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    if (tarjeta.clienteId !== clienteId) {
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

    const { titulo, cuerpo } = body as {
      titulo?: unknown;
      cuerpo?: unknown;
    };

    if (titulo !== undefined) {
      if (typeof titulo !== "string" || !titulo.trim()) {
        return NextResponse.json(
          { message: "El título no puede estar vacío" },
          { status: 400 }
        );
      }
    }

    const actualizada = await prisma.kanbanTarjeta.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo: (titulo as string).trim() }),
        ...(cuerpo !== undefined && {
          cuerpo: cuerpo === null ? null : typeof cuerpo === "string" ? cuerpo : undefined,
        }),
      },
    });

    return NextResponse.json({ tarjeta: actualizada });
  } catch (error) {
    console.error("Error al editar tarjeta:", error);
    return NextResponse.json(
      { message: "Error al editar tarjeta" },
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

    const tarjeta = await prisma.kanbanTarjeta.findUnique({
      where: { id },
      select: { id: true, clienteId: true, columnaId: true, orden: true },
    });

    if (!tarjeta) {
      return NextResponse.json(
        { message: "Tarjeta no encontrada" },
        { status: 404 }
      );
    }

    if (tarjeta.clienteId !== clienteId) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.kanbanTarjeta.delete({ where: { id } });

      const restantes = await tx.kanbanTarjeta.findMany({
        where: { columnaId: tarjeta.columnaId },
        orderBy: { orden: "asc" },
        select: { id: true },
      });

      for (let i = 0; i < restantes.length; i++) {
        await tx.kanbanTarjeta.update({
          where: { id: restantes[i].id },
          data: { orden: i },
        });
      }
    });

    return NextResponse.json({ message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("Error al eliminar tarjeta:", error);
    return NextResponse.json(
      { message: "Error al eliminar tarjeta" },
      { status: 500 }
    );
  }
}
