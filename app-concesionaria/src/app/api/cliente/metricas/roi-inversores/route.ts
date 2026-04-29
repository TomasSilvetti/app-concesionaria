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

    const participantes = await prisma.inversionParticipante.findMany({
      where: {
        esConcecionaria: false,
        Inversion: {
          Operation: {
            clienteId,
            estado: "cerrada",
            fechaVenta: { gte: desde, lte: hasta },
          },
        },
      },
      select: {
        montoAporte: true,
        porcentajeUtilidad: true,
        Inversor: { select: { nombre: true } },
      },
    });

    // Agrupar por inversor
    const mapaInversores = new Map<
      string,
      { montoAportado: number; retorno: number }
    >();

    for (const p of participantes) {
      const nombre = p.Inversor?.nombre ?? "Inversor desconocido";
      const retornoParticipacion =
        p.porcentajeUtilidad != null
          ? (p.montoAporte * p.porcentajeUtilidad) / 100
          : 0;

      const existing = mapaInversores.get(nombre) ?? { montoAportado: 0, retorno: 0 };
      mapaInversores.set(nombre, {
        montoAportado: existing.montoAportado + p.montoAporte,
        retorno: existing.retorno + retornoParticipacion,
      });
    }

    const resultado = Array.from(mapaInversores.entries()).map(
      ([inversor, { montoAportado, retorno }]) => ({
        inversor,
        montoAportado,
        retorno,
        roi:
          montoAportado > 0
            ? parseFloat(((retorno / montoAportado) * 100).toFixed(2))
            : 0,
      })
    );

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Error al calcular ROI por inversor:", error);
    return NextResponse.json(
      { message: "Error al calcular ROI por inversor" },
      { status: 500 }
    );
  }
}
