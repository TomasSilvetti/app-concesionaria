import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatGasto(expense: {
  id: string;
  descripcion: string;
  monto: number;
  origenId: string;
  categoriaId: string;
  Origin: { nombre: string };
  Category: { nombre: string };
}) {
  return {
    id: expense.id,
    descripcion: expense.descripcion,
    monto: expense.monto,
    origenId: expense.origenId,
    origenNombre: expense.Origin.nombre,
    categoriaId: expense.categoriaId,
    categoriaNombre: expense.Category.nombre,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: { operacionId: operation.id },
      include: {
        Origin: { select: { nombre: true } },
        Category: { select: { nombre: true } },
      },
      orderBy: { creadoEn: "asc" },
    });

    return NextResponse.json({ gastos: expenses.map(formatGasto) });
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json({ message: "Error al obtener gastos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { descripcion, monto, origenId, categoriaId } = body;

    const errors: string[] = [];
    if (!descripcion || !String(descripcion).trim()) errors.push("descripcion es requerida");
    if (monto === undefined || monto === null) errors.push("monto es requerido");
    if (typeof monto === "number" && monto <= 0) errors.push("monto debe ser mayor a 0");
    if (!origenId) errors.push("origenId es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0] }, { status: 400 });
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return NextResponse.json({ error: "monto debe ser un número mayor a 0" }, { status: 400 });
    }

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const [origen, categoria] = await Promise.all([
      prisma.origin.findFirst({ where: { id: origenId, clienteId } }),
      prisma.category.findFirst({ where: { id: categoriaId, clienteId } }),
    ]);
    if (!origen) {
      return NextResponse.json({ error: "origenId no existe o no pertenece al cliente" }, { status: 400 });
    }
    if (!categoria) {
      return NextResponse.json({ error: "categoriaId no existe o no pertenece al cliente" }, { status: 400 });
    }

    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          id: crypto.randomUUID(),
          clienteId,
          operacionId: operation.id,
          descripcion: String(descripcion).trim(),
          monto: montoNum,
          origenId,
          categoriaId,
        },
        include: {
          Origin: { select: { nombre: true } },
          Category: { select: { nombre: true } },
        },
      });

      const aggregate = await tx.expense.aggregate({
        where: { operacionId: operation.id },
        _sum: { monto: true },
      });
      const gastosAsociados = aggregate._sum.monto ?? 0;
      const ingresosNetos = operation.ingresosBrutos - gastosAsociados;
      const comision = operation.precioVentaTotal > 0
        ? (ingresosNetos / operation.precioVentaTotal) * 100
        : 0;

      await tx.operation.update({
        where: { id: operation.id },
        data: { gastosAsociados, ingresosNetos, comision, actualizadoEn: new Date() },
      });

      return created;
    });

    return NextResponse.json({ gasto: formatGasto(expense) }, { status: 201 });
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json({ message: "Error al crear gasto" }, { status: 500 });
  }
}
