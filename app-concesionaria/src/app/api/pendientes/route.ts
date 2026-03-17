import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const pendientes = await prisma.pendiente.findMany({
      where: { clienteId: session.user.clienteId },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json(pendientes);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener los pendientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.clienteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { nombreCliente, detalle } = body;

    if (!nombreCliente?.trim()) {
      return NextResponse.json(
        { error: "El nombre del cliente es requerido" },
        { status: 400 }
      );
    }
    if (!detalle?.trim()) {
      return NextResponse.json(
        { error: "El detalle del auto es requerido" },
        { status: 400 }
      );
    }

    const pendiente = await prisma.pendiente.create({
      data: {
        id: randomUUID(),
        clienteId: session.user.clienteId,
        nombreCliente: nombreCliente.trim(),
        detalle: detalle.trim(),
        actualizadoEn: new Date(),
      },
    });

    return NextResponse.json(pendiente, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear el pendiente" },
      { status: 500 }
    );
  }
}
