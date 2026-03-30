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
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const expense = await prisma.expense.findFirst({
      where: { id, clienteId },
    });

    if (!expense) {
      return NextResponse.json({ message: "Gasto no encontrado" }, { status: 404 });
    }

    if (expense.operacionId !== null) {
      return NextResponse.json(
        { message: "No se puede eliminar un gasto asociado a una operación" },
        { status: 400 }
      );
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json(
      { message: "Error al eliminar gasto" },
      { status: 500 }
    );
  }
}
