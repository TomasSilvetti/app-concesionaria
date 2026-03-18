import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const origins = await prisma.origin.findMany({
      where: { clienteId },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ origins });
  } catch (error) {
    console.error("Error al obtener orígenes:", error);
    return NextResponse.json({ message: "Error al obtener orígenes" }, { status: 500 });
  }
}

export async function POST(
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
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { nombre } = body;

    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
    }

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const existing = await prisma.origin.findFirst({
      where: { clienteId, nombre: String(nombre).trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un origen con ese nombre" }, { status: 400 });
    }

    const origin = await prisma.origin.create({
      data: {
        id: crypto.randomUUID(),
        clienteId,
        nombre: String(nombre).trim(),
      },
      select: { id: true, nombre: true },
    });

    return NextResponse.json({ origin }, { status: 201 });
  } catch (error) {
    console.error("Error al crear origen:", error);
    return NextResponse.json({ message: "Error al crear origen" }, { status: 500 });
  }
}
