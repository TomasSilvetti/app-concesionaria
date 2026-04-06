import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden ver plantillas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      select: { pdfOriginal: true, mimeType: true },
    });

    if (!template) {
      return NextResponse.json({ message: "Plantilla no encontrada" }, { status: 404 });
    }

    return new NextResponse(template.pdfOriginal, {
      status: 200,
      headers: {
        "Content-Type": template.mimeType ?? "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("Error al obtener PDF de plantilla:", error);
    return NextResponse.json({ message: "Error al obtener PDF" }, { status: 500 });
  }
}
