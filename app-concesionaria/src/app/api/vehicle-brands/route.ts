import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;
  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const brands = await prisma.vehicleBrand.findMany({
    where: { clienteId },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ brands });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;
  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const { nombre } = await request.json();
  if (!nombre?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const brand = await prisma.vehicleBrand.create({
    data: {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      clienteId,
      actualizadoEn: new Date(),
    },
    select: { id: true, nombre: true },
  });

  return NextResponse.json({ brand }, { status: 201 });
}
