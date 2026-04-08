import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;
  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const { id } = await params;

  const category = await prisma.vehicleCategory.findFirst({
    where: { id, clienteId },
  });

  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  await prisma.vehicleCategory.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
