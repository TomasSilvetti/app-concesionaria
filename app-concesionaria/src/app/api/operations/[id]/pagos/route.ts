import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
      select: { id: true, precioVentaTotal: true },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    const pagos = await prisma.pago.findMany({
      where: { operacionId: operation.id },
      orderBy: { fecha: "asc" },
      select: {
        id: true,
        fecha: true,
        monto: true,
        nota: true,
        metodoPagoId: true,
        PaymentMethod: { select: { nombre: true } },
      },
    });

    const saldado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const pendiente = Math.max(operation.precioVentaTotal - saldado, 0);

    return NextResponse.json({
      pagos: pagos.map((p) => ({
        id: p.id,
        fecha: p.fecha,
        monto: p.monto,
        nota: p.nota,
        metodoPagoId: p.metodoPagoId,
        metodoPagoNombre: p.PaymentMethod.nombre,
      })),
      saldado,
      pendiente,
    });
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return NextResponse.json(
      { message: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
      select: { id: true, precioVentaTotal: true, estado: true },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Cuerpo JSON inválido" },
        { status: 400 }
      );
    }

    const { fecha, metodoPagoId, monto, nota } = body as {
      fecha?: unknown;
      metodoPagoId?: unknown;
      monto?: unknown;
      nota?: unknown;
    };

    const errors: string[] = [];

    if (!fecha || typeof fecha !== "string") {
      errors.push("fecha es requerida");
    }

    if (!metodoPagoId || typeof metodoPagoId !== "string") {
      errors.push("metodoPagoId es requerido");
    }

    const montoNum =
      typeof monto === "number"
        ? monto
        : typeof monto === "string"
        ? parseFloat(monto)
        : NaN;

    if (isNaN(montoNum) || montoNum <= 0) {
      errors.push("monto debe ser un número mayor a 0");
    }

    if (nota !== undefined && nota !== null && typeof nota !== "string") {
      errors.push("nota debe ser un texto");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Errores de validación", errors },
        { status: 400 }
      );
    }

    const parsedFecha = new Date(fecha as string);
    if (isNaN(parsedFecha.getTime())) {
      return NextResponse.json(
        { message: "fecha debe ser una fecha válida en formato ISO" },
        { status: 400 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: metodoPagoId as string, clienteId },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { message: "metodoPagoId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          id: randomUUID(),
          operacionId: operation.id,
          clienteId,
          fecha: parsedFecha,
          metodoPagoId: metodoPagoId as string,
          monto: montoNum,
          nota: nota ? (nota as string).trim() || null : null,
          actualizadoEn: now,
        },
        select: {
          id: true,
          fecha: true,
          monto: true,
          nota: true,
          metodoPagoId: true,
          creadoEn: true,
          PaymentMethod: {
            select: { nombre: true },
          },
        },
      });

      const aggregate = await tx.pago.aggregate({
        where: { operacionId: operation.id },
        _sum: { monto: true },
      });

      const saldado = aggregate._sum.monto ?? 0;
      const pendiente = operation.precioVentaTotal - saldado;

      if (pendiente <= 0) {
        await tx.operation.update({
          where: { id: operation.id },
          data: { estado: "cerrada", actualizadoEn: now },
        });
      }

      return { pago, saldado, pendiente: Math.max(pendiente, 0) };
    });

    return NextResponse.json(
      {
        pago: {
          id: result.pago.id,
          fecha: result.pago.fecha,
          monto: result.pago.monto,
          nota: result.pago.nota,
          metodoPagoId: result.pago.metodoPagoId,
          metodoPagoNombre: result.pago.PaymentMethod.nombre,
          creadoEn: result.pago.creadoEn,
        },
        saldado: result.saldado,
        pendiente: result.pendiente,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return NextResponse.json(
      { message: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
