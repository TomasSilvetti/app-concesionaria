import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id } = await params;

    const origin = await prisma.origin.findFirst({ where: { id, clienteId } });
    if (!origin) {
      return NextResponse.json({ message: "Origen no encontrado" }, { status: 404 });
    }

    await prisma.origin.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar origen:", error);
    return NextResponse.json({ message: "Error al eliminar origen" }, { status: 500 });
  }
}
