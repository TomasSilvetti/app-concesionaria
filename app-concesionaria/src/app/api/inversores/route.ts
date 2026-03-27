import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
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

    const q = req.nextUrl.searchParams.get("q") ?? "";

    const inversores = await prisma.inversor.findMany({
      where: {
        clienteId,
        nombre: { contains: q, mode: "insensitive" },
      },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
      take: 20,
    });

    return NextResponse.json({ inversores });
  } catch (error) {
    console.error("Error al buscar inversores:", error);
    return NextResponse.json(
      { message: "Error al buscar inversores" },
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
        { message: "El nombre del inversor es requerido" },
        { status: 400 }
      );
    }

    const inversor = await prisma.inversor.create({
      data: {
        id: randomUUID(),
        clienteId,
        nombre: nombre.trim(),
      },
      select: { id: true, nombre: true, creadoEn: true },
    });

    return NextResponse.json({ inversor }, { status: 201 });
  } catch (error) {
    console.error("Error al crear inversor:", error);
    return NextResponse.json(
      { message: "Error al crear inversor" },
      { status: 500 }
    );
  }
}
