import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getDefaultPeriod(): { desde: Date; hasta: Date } {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const desde = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const hasta = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  return { desde, hasta };
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
    const desdeParam = searchParams.get("desde");
    const hastaParam = searchParams.get("hasta");

    let desde: Date;
    let hasta: Date;

    if (desdeParam || hastaParam) {
      if (!desdeParam || !hastaParam) {
        return NextResponse.json(
          { message: "Se deben enviar 'desde' y 'hasta' juntos" },
          { status: 400 }
        );
      }
      desde = new Date(desdeParam);
      hasta = new Date(hastaParam);
      if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
        return NextResponse.json(
          { message: "Formato de fecha inválido. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
    } else {
      ({ desde, hasta } = getDefaultPeriod());
    }

    hasta.setHours(23, 59, 59, 999);

    const expenses = await prisma.expense.findMany({
      where: {
        clienteId,
        fecha: { gte: desde, lte: hasta },
      },
      include: {
        Origin: { select: { nombre: true } },
        Operation: {
          select: {
            idOperacion: true,
            VehiculoVendido: {
              select: {
                VehiclePhoto: {
                  select: { id: true },
                  orderBy: { orden: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const result = expenses.map((e) => ({
      id: e.id,
      operacionId: e.Operation?.idOperacion ?? null,
      descripcion: e.descripcion,
      quienPago: e.Origin.nombre,
      monto: e.monto,
      fecha: e.fecha.toISOString(),
      vehiculoFotoId: e.Operation?.VehiculoVendido?.VehiclePhoto?.[0]?.id ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json(
      { message: "Error al obtener gastos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { descripcion, origenId, categoriaId, monto } = body;

    const errors: string[] = [];
    if (!descripcion || !String(descripcion).trim()) errors.push("descripcion es requerida");
    if (!origenId) errors.push("origenId es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (monto === undefined || monto === null) errors.push("monto es requerido");
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json(
        { error: "monto debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    const [origen, categoria] = await Promise.all([
      prisma.origin.findFirst({ where: { id: origenId, clienteId } }),
      prisma.category.findFirst({ where: { id: categoriaId, clienteId } }),
    ]);
    if (!origen) {
      return NextResponse.json(
        { error: "origenId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }
    if (!categoria) {
      return NextResponse.json(
        { error: "categoriaId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        id: crypto.randomUUID(),
        clienteId,
        descripcion: String(descripcion).trim(),
        monto: montoNum,
        origenId,
        categoriaId,
        actualizadoEn: new Date(),
      },
      include: {
        Origin: { select: { nombre: true } },
      },
    });

    return NextResponse.json(
      {
        id: expense.id,
        operacionId: null,
        descripcion: expense.descripcion,
        quienPago: expense.Origin.nombre,
        monto: expense.monto,
        fecha: expense.fecha.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json(
      { message: "Error al crear gasto" },
      { status: 500 }
    );
  }
}
