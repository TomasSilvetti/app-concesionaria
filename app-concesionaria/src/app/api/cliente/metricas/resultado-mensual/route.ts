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

    const [pagos, gastos, ops0km, vehiculosStock] = await Promise.all([
      // Ingresos: todos los pagos del período
      prisma.pago.findMany({
        where: {
          clienteId,
          fecha: { gte: desde, lte: hasta },
        },
        select: { fecha: true, monto: true },
      }),

      // Gastos directos: todos los expenses del período
      prisma.expense.findMany({
        where: {
          clienteId,
          fecha: { gte: desde, lte: hasta },
        },
        select: { fecha: true, monto: true },
      }),

      // Precio de toma de operaciones 0km (no canceladas) en el período
      prisma.operation.findMany({
        where: {
          clienteId,
          tipoOperacion: { not: "Venta desde stock" },
          estado: { not: "cancelada" },
          fechaInicio: { gte: desde, lte: hasta },
          precioToma: { not: null },
        },
        select: { fechaInicio: true, precioToma: true },
      }),

      // Precio de toma de vehículos de stock ingresados en el período
      prisma.vehicle.findMany({
        where: {
          clienteId,
          operacionId: null,
          creadoEn: { gte: desde, lte: hasta },
          precioToma: { not: null },
        },
        select: { creadoEn: true, precioToma: true },
      }),
    ]);

    type MesData = { ingresos: number; gastos: number };
    const mapa = new Map<string, MesData>();

    const getOrCreate = (key: string): MesData => {
      if (!mapa.has(key)) mapa.set(key, { ingresos: 0, gastos: 0 });
      return mapa.get(key)!;
    };

    for (const p of pagos) {
      const entry = getOrCreate(mesKey(p.fecha));
      entry.ingresos += p.monto;
    }

    for (const g of gastos) {
      const entry = getOrCreate(mesKey(g.fecha));
      entry.gastos += g.monto;
    }

    for (const op of ops0km) {
      if (!op.fechaInicio) continue;
      const entry = getOrCreate(mesKey(op.fechaInicio));
      entry.gastos += op.precioToma ?? 0;
    }

    for (const v of vehiculosStock) {
      const entry = getOrCreate(mesKey(v.creadoEn));
      entry.gastos += v.precioToma ?? 0;
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
