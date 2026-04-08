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

  const brand = await prisma.vehicleBrand.findFirst({
    where: { id, clienteId },
  });

  if (!brand) {
    return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 });
  }

  await prisma.vehicleBrand.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
