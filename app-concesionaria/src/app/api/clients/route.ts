import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const clients = await prisma.client.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.rol !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

  if (!nombre) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      id: randomUUID(),
      nombre,
      activo: true,
      modulos: { operaciones: true, stock: true, gastos: true, reportes: true },
      actualizadoEn: new Date(),
    },
    select: { id: true, nombre: true },
  });

  return NextResponse.json({ client }, { status: 201 });
}
