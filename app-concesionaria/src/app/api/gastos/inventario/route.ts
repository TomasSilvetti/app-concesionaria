import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
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

    const result = await prisma.vehicle.aggregate({
      where: { clienteId, estado: "disponible" },
      _sum: { precioRevista: true, precioToma: true },
    });

    const valorRevista = result._sum.precioRevista ?? 0;
    const valorRealToma = result._sum.precioToma ?? 0;

    return NextResponse.json({ valorRevista, valorRealToma });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return NextResponse.json(
      { message: "Error al obtener inventario" },
      { status: 500 }
    );
  }
}
