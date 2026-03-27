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
      select: {
        id: true,
        nombre: true,
        contexto: true,
        mimeType: true,
        creadoEn: true,
        actualizadoEn: true,
        clienteId: true,
        DocumentField: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            valorFijo: true,
            rutaAuto: true,
            posX: true,
            posY: true,
            ancho: true,
            alto: true,
            orden: true,
          },
          orderBy: { orden: "asc" },
        },
        DocumentAssignment: {
          select: {
            id: true,
            clienteId: true,
            activo: true,
            creadoEn: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener plantilla:", error);
    return NextResponse.json(
      { message: "Error al obtener plantilla" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden eliminar plantillas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.documentTemplate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    await prisma.documentTemplate.delete({ where: { id } });

    return NextResponse.json(
      { message: "Plantilla eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar plantilla:", error);
    return NextResponse.json(
      { message: "Error al eliminar plantilla" },
      { status: 500 }
    );
  }
}
