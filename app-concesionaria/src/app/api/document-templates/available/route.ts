import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_CONTEXT_TYPES = ["operacion", "vehiculo"] as const;
type ContextType = (typeof VALID_CONTEXT_TYPES)[number];

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
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
      return NextResponse.json(
        { message: "El parámetro contextId es requerido" },
        { status: 400 }
      );
    }

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "El usuario no tiene empresa asociada" },
        { status: 403 }
      );
    }

    const assignments = await prisma.documentAssignment.findMany({
      where: {
        clienteId,
        activo: true,
        template: {
          contexto: contextType as ContextType,
        },
      },
      select: {
        template: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    const templates = assignments.map((a) => a.template);

    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    console.error("Error al obtener plantillas disponibles:", error);
    return NextResponse.json(
      { message: "Error al obtener plantillas disponibles" },
      { status: 500 }
    );
  }
}
