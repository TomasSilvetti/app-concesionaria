import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    if (!desdeParam || !hastaParam) {
      return NextResponse.json(
        { message: "Los parámetros 'desde' y 'hasta' son requeridos" },
        { status: 400 }
      );
    }

    const desde = new Date(desdeParam);
    const hasta = new Date(hastaParam);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return NextResponse.json(
        { message: "Formato de fecha inválido. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    hasta.setHours(23, 59, 59, 999);

    const periodoFiltro = { gte: desde, lte: hasta };

    const [cerradas, canceladas, abiertas] = await Promise.all([
      prisma.operation.count({
        where: { clienteId, estado: "cerrada", fechaInicio: periodoFiltro },
      }),
      prisma.operation.count({
        where: { clienteId, estado: "cancelada", fechaInicio: periodoFiltro },
      }),
      prisma.operation.count({
        where: {
          clienteId,
          estado: { in: ["abierta", "open"] },
          fechaInicio: periodoFiltro,
        },
      }),
    ]);

    const total = cerradas + canceladas + abiertas;

    return NextResponse.json({ cerradas, canceladas, abiertas, total });
  } catch (error) {
    console.error("Error al obtener operaciones por estado:", error);
    return NextResponse.json(
      { message: "Error al obtener operaciones por estado" },
      { status: 500 }
    );
  }
}
