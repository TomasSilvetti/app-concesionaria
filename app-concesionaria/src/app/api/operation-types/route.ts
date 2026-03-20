import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_OPERATION_TYPES = [
  "Venta desde stock",
  "Venta 0km",
  "A conseguir",
] as const;

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const clienteId = session.user.clienteId;

  if (!clienteId) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 400 }
    );
  }

  const operationTypes = await prisma.operationType.findMany({
    where: {
      clienteId,
      nombre: {
        in: [...VALID_OPERATION_TYPES],
      },
    },
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return NextResponse.json({ types: operationTypes });
}
