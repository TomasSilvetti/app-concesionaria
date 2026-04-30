import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    // Garantizar que "Caja Empresa" exista para este cliente
    await prisma.origin.upsert({
      where: { clienteId_nombre: { clienteId, nombre: "Caja Empresa" } },
      update: {},
      create: { id: crypto.randomUUID(), clienteId, nombre: "Caja Empresa" },
    });

    const origins = await prisma.origin.findMany({
      where: { clienteId },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });

    // "Caja Empresa" siempre primera en la lista
    const sorted = [
      ...origins.filter((o) => o.nombre === "Caja Empresa"),
      ...origins.filter((o) => o.nombre !== "Caja Empresa"),
    ];

    return NextResponse.json({ origins: sorted });
  } catch (error) {
    console.error("Error al obtener orígenes:", error);
    return NextResponse.json({ message: "Error al obtener orígenes" }, { status: 500 });
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
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const body = await req.json();
    const { nombre } = body;

    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: "nombre es requerido" }, { status: 400 });
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
