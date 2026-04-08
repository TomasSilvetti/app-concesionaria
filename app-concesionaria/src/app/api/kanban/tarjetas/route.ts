import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
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

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Cuerpo JSON inválido" },
        { status: 400 }
      );
    }

    const { columnaId, titulo, cuerpo } = body as {
      columnaId?: unknown;
      titulo?: unknown;
      cuerpo?: unknown;
    };

    if (!titulo || typeof titulo !== "string" || !titulo.trim()) {
      return NextResponse.json(
        { message: "El título es requerido" },
        { status: 400 }
      );
    }

    if (!columnaId || typeof columnaId !== "string") {
      return NextResponse.json(
        { message: "columnaId es requerido" },
        { status: 400 }
      );
    }

    const columna = await prisma.kanbanColumna.findUnique({
      where: { id: columnaId },
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

    const maxOrden = await prisma.kanbanTarjeta.aggregate({
      where: { columnaId },
      _max: { orden: true },
    });

    const nuevoOrden = (maxOrden._max.orden ?? -1) + 1;

    const tarjeta = await prisma.kanbanTarjeta.create({
      data: {
        id: uuidv4(),
        clienteId,
        columnaId,
        titulo: titulo.trim(),
        cuerpo: cuerpo && typeof cuerpo === "string" ? cuerpo : null,
        orden: nuevoOrden,
        creadoPorId: session.user.id,
        creadoPorNombre: session.user.nombre ?? "",
      },
    });

    return NextResponse.json({ tarjeta }, { status: 201 });
  } catch (error) {
    console.error("Error al crear tarjeta:", error);
    return NextResponse.json(
      { message: "Error al crear tarjeta" },
      { status: 500 }
    );
  }
}
