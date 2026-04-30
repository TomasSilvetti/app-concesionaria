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
    const tipo = _req.nextUrl.searchParams.get("tipo") ?? "gasto";

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      where: { clienteId, tipo },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json({ message: "Error al obtener categorías" }, { status: 500 });
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
    const { nombre, tipo = "gasto" } = body;

    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
    }

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const tipoValido = tipo === "ingreso" ? "ingreso" : "gasto";

    const existing = await prisma.category.findFirst({
      where: { clienteId, nombre: String(nombre).trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        clienteId,
        nombre: String(nombre).trim(),
        tipo: tipoValido,
      },
      select: { id: true, nombre: true },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json({ message: "Error al crear categoría" }, { status: 500 });
  }
}
