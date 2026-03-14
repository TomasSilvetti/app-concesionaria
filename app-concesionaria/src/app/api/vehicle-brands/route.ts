import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const clienteId = session.user.clienteId;
  if (!clienteId) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 400 });
  }

  const brands = await prisma.vehicleBrand.findMany({
    where: { clienteId },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({ brands });
}
