import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const COLUMNAS_DEFAULT = ["Buscando", "En negociación", "Listo para entregar"];

export async function GET() {
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

    let columnas = await prisma.kanbanColumna.findMany({
      where: { clienteId },
      orderBy: { orden: "asc" },
      include: {
        tarjetas: {
          orderBy: { orden: "asc" },
        },
      },
    });

    if (columnas.length === 0) {
      const creadas = await prisma.$transaction(
        COLUMNAS_DEFAULT.map((nombre, i) =>
          prisma.kanbanColumna.create({
            data: { id: randomUUID(), clienteId, nombre, orden: i },
            include: { tarjetas: true },
          })
        )
      );
      columnas = creadas;
    }

    return NextResponse.json({ columnas });
  } catch (error) {
    console.error("Error al obtener columnas:", error);
    return NextResponse.json(
      { message: "Error al obtener columnas" },
      { status: 500 }
    );
  }
}

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

    const { nombre } = body as { nombre?: unknown };

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { message: "El nombre de la columna es requerido" },
        { status: 400 }
      );
    }

    const ultima = await prisma.kanbanColumna.findFirst({
      where: { clienteId },
      orderBy: { orden: "desc" },
      select: { orden: true },
    });

    const orden = (ultima?.orden ?? 0) + 1;

    const columna = await prisma.kanbanColumna.create({
      data: {
        id: randomUUID(),
        clienteId,
        nombre: nombre.trim(),
        orden,
      },
    });

    return NextResponse.json({ columna }, { status: 201 });
  } catch (error) {
    console.error("Error al crear columna:", error);
    return NextResponse.json(
      { message: "Error al crear columna" },
      { status: 500 }
    );
  }
}
