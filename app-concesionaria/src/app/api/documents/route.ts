import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const VALID_CONTEXT_TYPES = ["operacion", "vehiculo"] as const;
type ContextType = (typeof VALID_CONTEXT_TYPES)[number];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json(
        { message: "El usuario no tiene empresa asociada" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const contextType = searchParams.get("contextType");
    const contextId = searchParams.get("contextId");

    if (!contextType || !VALID_CONTEXT_TYPES.includes(contextType as ContextType)) {
      return NextResponse.json(
        { message: "contextType inválido. Debe ser 'operacion' o 'vehiculo'" },
        { status: 400 }
      );
    }
    if (!contextId) {
      return NextResponse.json({ message: "contextId es requerido" }, { status: 400 });
    }

    const documents = await prisma.generatedDocument.findMany({
      where: {
        clienteId,
        contexto: contextType as ContextType,
        contextId,
      },
      select: {
        id: true,
        nombreArchivo: true,
        mimeType: true,
        creadoEn: true,
        actualizadoEn: true,
        templateId: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error("Error al listar documentos generados:", error);
    return NextResponse.json(
      { message: "Error al listar documentos" },
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
        { message: "El usuario no tiene empresa asociada" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const contextType = formData.get("contextType") as string | null;
    const contextId = formData.get("contextId") as string | null;

    if (!file) {
      return NextResponse.json({ message: "El archivo es requerido" }, { status: 400 });
    }
    if (!contextType || !VALID_CONTEXT_TYPES.includes(contextType as ContextType)) {
      return NextResponse.json(
        { message: "contextType inválido. Debe ser 'operacion' o 'vehiculo'" },
        { status: 400 }
      );
    }
    if (!contextId) {
      return NextResponse.json({ message: "contextId es requerido" }, { status: 400 });
    }

    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: "El archivo no puede superar los 20 MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfGenerado = Buffer.from(arrayBuffer);
    const now = new Date();

    const generated = await prisma.generatedDocument.create({
      data: {
        id: randomUUID(),
        templateId: null,
        clienteId,
        contexto: contextType as ContextType,
        contextId,
        pdfGenerado,
        nombreArchivo: file.name,
        mimeType: file.type || "application/octet-stream",
        creadoEn: now,
        actualizadoEn: now,
      },
    });

    return NextResponse.json(
      {
        id: generated.id,
        nombreArchivo: generated.nombreArchivo,
        creadoEn: generated.creadoEn,
        templateId: generated.templateId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al subir documento:", error);
    return NextResponse.json(
      { message: "Error al subir el documento" },
      { status: 500 }
    );
  }
}
