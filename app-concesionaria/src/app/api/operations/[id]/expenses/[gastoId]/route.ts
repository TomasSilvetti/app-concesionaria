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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; gastoId: string }> }
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

    const { id, gastoId } = await params;
    const body = await req.json();
    const { descripcion, monto, origenId, categoriaId } = body;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id: gastoId, operacionId: operation.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "Gasto no encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (descripcion !== undefined) {
      if (!String(descripcion).trim()) {
        return NextResponse.json({ error: "descripcion no puede estar vacía" }, { status: 400 });
      }
      updateData.descripcion = String(descripcion).trim();
    }

    if (monto !== undefined) {
      const montoNum = parseFloat(monto);
      if (isNaN(montoNum) || montoNum <= 0) {
        return NextResponse.json({ error: "monto debe ser un número mayor a 0" }, { status: 400 });
      }
      updateData.monto = montoNum;
    }

    if (origenId !== undefined) {
      const origen = await prisma.origin.findFirst({ where: { id: origenId, clienteId } });
      if (!origen) {
        return NextResponse.json({ error: "origenId no existe o no pertenece al cliente" }, { status: 400 });
      }
      updateData.origenId = origenId;
    }

    if (categoriaId !== undefined) {
      const categoria = await prisma.category.findFirst({ where: { id: categoriaId, clienteId } });
      if (!categoria) {
        return NextResponse.json({ error: "categoriaId no existe o no pertenece al cliente" }, { status: 400 });
      }
      updateData.categoriaId = categoriaId;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.expense.update({
        where: { id: gastoId },
        data: updateData,
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

      return result;
    });

    return NextResponse.json({ gasto: formatGasto(updated) });
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    return NextResponse.json({ message: "Error al actualizar gasto" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; gastoId: string }> }
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

    const { id, gastoId } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
    });
    if (!operation) {
      return NextResponse.json({ message: "Operación no encontrada" }, { status: 404 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id: gastoId, operacionId: operation.id },
    });
    if (!existing) {
      return NextResponse.json({ message: "Gasto no encontrado" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.delete({ where: { id: gastoId } });

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
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json({ message: "Error al eliminar gasto" }, { status: 500 });
  }
}
