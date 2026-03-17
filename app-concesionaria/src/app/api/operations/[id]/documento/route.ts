import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function GET(
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
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
      include: {
        OperationDocument: true,
      },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    if (!operation.OperationDocument) {
      return NextResponse.json(
        { message: "La operación no tiene documento de detalle" },
        { status: 404 }
      );
    }

    const doc = operation.OperationDocument;

    return new NextResponse(doc.datos, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${doc.nombreArchivo}"`,
        "Content-Length": doc.datos.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error al obtener documento:", error);
    return NextResponse.json(
      { message: "Error al obtener documento" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const archivo = formData.get("documentoDetalle") as File | null;

    if (!archivo || archivo.size === 0) {
      return NextResponse.json(
        { message: "documentoDetalle es requerido" },
        { status: 400 }
      );
    }

    const ALLOWED_MIME_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!ALLOWED_MIME_TYPES.includes(archivo.type)) {
      return NextResponse.json(
        { message: "Tipo de documento no permitido. Solo se permiten PDF, DOC y DOCX" },
        { status: 400 }
      );
    }

    if (archivo.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { message: "El documento excede el tamaño máximo permitido de 20MB" },
        { status: 400 }
      );
    }

    const buffer = await archivo.arrayBuffer();
    const bytes = Buffer.from(buffer);
    const now = new Date();

    await prisma.operationDocument.upsert({
      where: { operacionId: operation.id },
      create: {
        id: randomUUID(),
        operacionId: operation.id,
        nombreArchivo: archivo.name,
        mimeType: archivo.type,
        datos: bytes,
        actualizadoEn: now,
      },
      update: {
        nombreArchivo: archivo.name,
        mimeType: archivo.type,
        datos: bytes,
        actualizadoEn: now,
      },
    });

    return NextResponse.json(
      { message: "Documento actualizado correctamente", nombreArchivo: archivo.name },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    return NextResponse.json(
      { message: "Error al actualizar documento" },
      { status: 500 }
    );
  }
}
