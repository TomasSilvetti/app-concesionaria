import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });

    const documentos = await prisma.repositorioDocumento.findMany({
      where: { clienteId },
      select: {
        id: true,
        nombre: true,
        nombreOriginal: true,
        mimeType: true,
        tamano: true,
        subidoPorNombre: true,
        creadoEn: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json(documentos);
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get("archivo") as File | null;
    if (!file) return NextResponse.json({ message: "Archivo requerido" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ message: "El archivo supera el límite de 50 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const nombreOriginal = file.name;
    const nombre = (formData.get("nombre") as string | null)?.trim() || nombreOriginal;

    const documento = await prisma.repositorioDocumento.create({
      data: {
        id: randomUUID(),
        clienteId,
        nombre,
        nombreOriginal,
        mimeType: file.type || "application/octet-stream",
        tamano: file.size,
        datos: buffer,
        subidoPorId: session.user.id,
        subidoPorNombre: session.user.nombre || session.user.username || "Desconocido",
      },
    });

    return NextResponse.json({
      id: documento.id,
      nombre: documento.nombre,
      nombreOriginal: documento.nombreOriginal,
      mimeType: documento.mimeType,
      tamano: documento.tamano,
      subidoPorNombre: documento.subidoPorNombre,
      creadoEn: documento.creadoEn,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
