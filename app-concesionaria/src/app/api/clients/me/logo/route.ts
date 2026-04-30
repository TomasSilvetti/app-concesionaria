import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Sin cliente asociado" }, { status: 403 });

    const client = await prisma.client.findUnique({
      where: { id: clienteId },
      select: { logo: true, nombre: true },
    });

    if (!client) return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 });

    return NextResponse.json({ logo: client.logo ?? null, nombre: client.nombre });
  } catch (error) {
    console.error("Error al obtener logo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Sin cliente asociado" }, { status: 403 });

    const body = await req.json();
    const { logo } = body;

    await prisma.client.update({
      where: { id: clienteId },
      data: { logo: logo ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar logo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
