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

    const { columnaId, orden } = body as { columnaId?: unknown; orden?: unknown };

    if (!columnaId || typeof columnaId !== "string") {
      return NextResponse.json(
        { message: "columnaId es requerido" },
        { status: 400 }
      );
    }

    if (orden === undefined || typeof orden !== "number" || !Number.isInteger(orden) || orden < 0) {
      return NextResponse.json(
        { message: "orden debe ser un entero no negativo" },
        { status: 400 }
      );
    }

    const columna = await prisma.kanbanColumna.findUnique({
      where: { id: columnaId },
      select: { id: true, clienteId: true },
    });

    if (!columna) {
      return NextResponse.json(
        { message: "Columna destino no encontrada" },
        { status: 404 }
      );
    }

    if (columna.clienteId !== clienteId) {
      return NextResponse.json(
        { message: "Sin permisos sobre la columna destino" },
        { status: 403 }
      );
    }

    const tarjetaActualizada = await prisma.kanbanTarjeta.update({
      where: { id },
      data: { columnaId, orden },
    });

    return NextResponse.json({ tarjeta: tarjetaActualizada });
  } catch (error) {
    console.error("Error al mover tarjeta:", error);
    return NextResponse.json(
      { message: "Error al mover tarjeta" },
      { status: 500 }
    );
  }
}
