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
    const desdeStr = searchParams.get("desde");
    const hastaStr = searchParams.get("hasta");

    if (!desdeStr || !hastaStr) {
      return NextResponse.json(
        { message: "Los parámetros 'desde' y 'hasta' son requeridos" },
        { status: 400 }
      );
    }

    const desde = new Date(desdeStr);
    const hasta = new Date(hastaStr);

    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return NextResponse.json(
        { message: "'desde' y 'hasta' deben ser fechas válidas en formato ISO" },
        { status: 400 }
      );
    }

    const pagos = await prisma.pago.findMany({
      where: {
        clienteId,
        fecha: { gte: desde, lte: hasta },
      },
      select: {
        monto: true,
        PaymentMethod: { select: { nombre: true } },
      },
    });

    // Agrupar por método de pago
    const mapaMetodos = new Map<string, number>();

    for (const pago of pagos) {
      const nombre = pago.PaymentMethod.nombre;
      mapaMetodos.set(nombre, (mapaMetodos.get(nombre) ?? 0) + pago.monto);
    }

    const resultado = Array.from(mapaMetodos.entries()).map(([metodo, total]) => ({
      metodo,
      total,
    }));

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Error al calcular cobros por método:", error);
    return NextResponse.json(
      { message: "Error al calcular cobros por método de pago" },
      { status: 500 }
    );
  }
}
