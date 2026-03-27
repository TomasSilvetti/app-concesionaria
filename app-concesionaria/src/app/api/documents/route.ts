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
        creadoEn: true,
        actualizadoEn: true,
      },
      orderBy: { creadoEn: "desc" },
    });

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    console.error("Error al listar documentos generados:", error);
    return NextResponse.json(
      { message: "Error al listar documentos" },
      { status: 500 }
    );
  }
}
