import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MESES_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function labelMes(year: number, month: number): string {
  return `${MESES_ES[month]} ${year}`;
}

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

    const ops = await prisma.operation.findMany({
      where: {
        clienteId,
        estado: "cerrada",
        fechaVenta: { gte: desde, lte: hasta },
      },
      select: {
        fechaVenta: true,
        ingresosBrutos: true,
        gastosAsociados: true,
        ingresosNetos: true,
      },
    });

    // Construir mapa mes -> acumulados
    const mapaMs = new Map<string, { ingresos: number; gastos: number; ganancia: number }>();

    for (const op of ops) {
      if (!op.fechaVenta) continue;
      const y = op.fechaVenta.getFullYear();
      const m = op.fechaVenta.getMonth();
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const existing = mapaMs.get(key) ?? { ingresos: 0, gastos: 0, ganancia: 0 };
      mapaMs.set(key, {
        ingresos: existing.ingresos + op.ingresosBrutos,
        gastos: existing.gastos + op.gastosAsociados,
        ganancia: existing.ganancia + op.ingresosNetos,
      });
    }

    // Generar array ordenado cubriendo todos los meses del rango
    const resultado: { mes: string; ingresos: number; gastos: number; ganancia: number }[] = [];

    const cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);
    const fin = new Date(hasta.getFullYear(), hasta.getMonth(), 1);

    while (cursor <= fin) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const entry = mapaMs.get(key) ?? { ingresos: 0, gastos: 0, ganancia: 0 };
      resultado.push({ mes: labelMes(y, m), ...entry });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Error al calcular resultado mensual:", error);
    return NextResponse.json(
      { message: "Error al calcular resultado mensual" },
      { status: 500 }
    );
  }
}
