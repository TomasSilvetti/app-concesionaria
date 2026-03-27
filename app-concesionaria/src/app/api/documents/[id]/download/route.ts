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
      return NextResponse.json(
        { message: "El usuario no tiene empresa asociada" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const doc = await prisma.generatedDocument.findUnique({
      where: { id },
      select: { id: true, clienteId: true, pdfGenerado: true, nombreArchivo: true, mimeType: true },
    });

    if (!doc) {
      return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });
    }

    if (doc.clienteId !== clienteId) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    const pdfArray = new Uint8Array(doc.pdfGenerado);

    return new NextResponse(pdfArray, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType ?? "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.nombreArchivo}"`,
        "Content-Length": String(pdfArray.byteLength),
      },
    });
  } catch (error) {
    console.error("Error al descargar documento:", error);
    return NextResponse.json(
      { message: "Error al descargar el documento" },
      { status: 500 }
    );
  }
}
