import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const mostrarTodasParam = searchParams.get("mostrarTodas");
    const mostrarTodas = mostrarTodasParam === "true";

    const operations = await prisma.operation.findMany({
      where: {
        clienteId,
        idOperacion: {
          not: {
            contains: "-INT-",
          },
        },
      },
      include: {
        Pago: {
          orderBy: { fecha: "asc" },
          include: {
            PaymentMethod: {
              select: { nombre: true },
            },
          },
        },
      },
      orderBy: { fechaInicio: "desc" },
    });

    const operacionesConCalculos = operations.map((op) => {
      const saldado = op.Pago.reduce((sum, p) => sum + p.monto, 0);
      const pendiente = Math.max(op.precioVentaTotal - saldado, 0);

      const pagosConDeuda = op.Pago.map((pago, index) => {
        const pagosHastaEsteInclusivo = op.Pago.slice(0, index + 1);
        const sumaPagosHastaAqui = pagosHastaEsteInclusivo.reduce(
          (sum, p) => sum + p.monto,
          0
        );
        const deuda = Math.max(op.precioVentaTotal - sumaPagosHastaAqui, 0);

        return {
          fecha: pago.fecha,
          metodoPago: pago.PaymentMethod.nombre,
          monto: pago.monto,
          nota: pago.nota,
          deuda,
        };
      });

      return {
        idOperacion: op.idOperacion,
        nombreComprador: op.nombreComprador,
        precioVentaTotal: op.precioVentaTotal,
        saldado,
        pendiente,
        pagos: pagosConDeuda,
      };
    });

    const operacionesFiltradas = mostrarTodas
      ? operacionesConCalculos
      : operacionesConCalculos.filter((op) => op.pendiente > 0);

    return NextResponse.json(
      { operaciones: operacionesFiltradas },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener cobranzas:", error);
    return NextResponse.json(
      { message: "Error al obtener cobranzas" },
      { status: 500 }
    );
  }
}
