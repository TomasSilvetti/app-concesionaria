import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;

  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { clienteId },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ paymentMethods });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;

  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const body = await request.json();
  const nombre: string = body?.nombre?.trim() ?? "";

  if (!nombre) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  const existing = await prisma.paymentMethod.findMany({
    where: { clienteId },
    select: { nombre: true },
  });

  const duplicate = existing.some(
    (pm) => pm.nombre.toLowerCase() === nombre.toLowerCase()
  );

  if (duplicate) {
    return NextResponse.json(
      { error: `Ya existe una forma de pago con el nombre "${nombre}"` },
      { status: 409 }
    );
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      id: randomUUID(),
      clienteId,
      nombre,
    },
    select: { id: true, nombre: true },
  });

  return NextResponse.json({ paymentMethod }, { status: 201 });
}
