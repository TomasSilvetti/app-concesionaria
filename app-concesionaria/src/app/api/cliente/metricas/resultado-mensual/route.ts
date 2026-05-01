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

function mesKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
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

    hasta.setHours(23, 59, 59, 999);

    const [operacionesCerradas, gastos, ingresosExtraordinarios] = await Promise.all([
      // Ingresos: neto de ops cerradas (precioVentaTotal - precioToma) agrupado por fechaVenta
      prisma.operation.findMany({
        where: {
          clienteId,
          estado: "cerrada",
          fechaVenta: { gte: desde, lte: hasta },
        },
        select: { fechaVenta: true, precioVentaTotal: true, precioToma: true },
      }),

      // Egresos pagados desde la caja empresa
      prisma.expense.findMany({
        where: {
          clienteId,
          fecha: { gte: desde, lte: hasta },
          tipo: "gasto",
          Origin: { nombre: "Caja Empresa" },
        },
        select: { fecha: true, monto: true },
      }),

      // Ingresos extraordinarios cobrados por la caja empresa
      prisma.expense.findMany({
        where: {
          clienteId,
          fecha: { gte: desde, lte: hasta },
          tipo: "ingreso",
          Origin: { nombre: "Caja Empresa" },
        },
        select: { fecha: true, monto: true },
      }),
    ]);

    type MesData = { ingresos: number; gastos: number };
    const mapa = new Map<string, MesData>();

    const getOrCreate = (key: string): MesData => {
      if (!mapa.has(key)) mapa.set(key, { ingresos: 0, gastos: 0 });
      return mapa.get(key)!;
    };

    for (const op of operacionesCerradas) {
      if (!op.fechaVenta) continue;
      const entry = getOrCreate(mesKey(op.fechaVenta));
      entry.ingresos += op.precioVentaTotal - (op.precioToma ?? 0);
    }

    for (const ie of ingresosExtraordinarios) {
      const entry = getOrCreate(mesKey(ie.fecha));
      entry.ingresos += ie.monto;
    }

    for (const g of gastos) {
      const entry = getOrCreate(mesKey(g.fecha));
      entry.gastos += g.monto;
    }

    // Generar array ordenado cubriendo todos los meses del rango
    const resultado: { mes: string; ingresos: number; gastos: number; ganancia: number }[] = [];

    const cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);
    const fin = new Date(hasta.getFullYear(), hasta.getMonth(), 1);

    while (cursor <= fin) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const entry = mapa.get(key) ?? { ingresos: 0, gastos: 0 };
      resultado.push({
        mes: labelMes(y, m),
        ingresos: entry.ingresos,
        gastos: entry.gastos,
        ganancia: entry.ingresos - entry.gastos,
      });
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
