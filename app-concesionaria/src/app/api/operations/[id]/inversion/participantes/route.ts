import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const operation = await prisma.operation.findFirst({
      where: { idOperacion: id, clienteId },
      select: { id: true, estado: true },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    if (operation.estado === "cerrada" || operation.estado === "cancelada") {
      return NextResponse.json(
        { message: "No se puede modificar una operación cerrada o cancelada" },
        { status: 403 }
      );
    }

    const inversion = await prisma.inversion.findUnique({
      where: { operacionId: operation.id },
      select: { id: true },
    });

    if (!inversion) {
      return NextResponse.json(
        { message: "La operación no tiene inversión registrada" },
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

    const { participantes } = body as {
      participantes?: { id: string; porcentajeUtilidad: number }[];
    };

    if (!Array.isArray(participantes) || participantes.length === 0) {
      return NextResponse.json(
        { message: "Se requiere al menos un participante" },
        { status: 400 }
      );
    }

    for (const p of participantes) {
      if (!p.id || typeof p.id !== "string") {
        return NextResponse.json(
          { message: "Cada participante debe tener un id válido" },
          { status: 400 }
        );
      }
      if (typeof p.porcentajeUtilidad !== "number" || isNaN(p.porcentajeUtilidad)) {
        return NextResponse.json(
          { message: "porcentajeUtilidad debe ser un número" },
          { status: 400 }
        );
      }
    }

    // Verificar que todos los participantes pertenezcan a esta inversión
    const participanteIds = participantes.map((p) => p.id);
    const participantesExistentes = await prisma.inversionParticipante.findMany({
      where: { id: { in: participanteIds }, inversionId: inversion.id },
      select: { id: true },
    });

    if (participantesExistentes.length !== participanteIds.length) {
      return NextResponse.json(
        { message: "Uno o más participantes no pertenecen a esta inversión" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      participantes.map((p) =>
        prisma.inversionParticipante.update({
          where: { id: p.id },
          data: {
            porcentajeUtilidad: p.porcentajeUtilidad,
            actualizadoEn: new Date(),
          },
        })
      )
    );

    const participantesActualizados = await prisma.inversionParticipante.findMany({
      where: { inversionId: inversion.id },
      include: { Inversor: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: "asc" },
    });

    return NextResponse.json({
      participantes: participantesActualizados.map((p) => ({
        id: p.id,
        esConcecionaria: p.esConcecionaria,
        inversorId: p.inversorId,
        inversorNombre: p.Inversor?.nombre ?? null,
        montoAporte: p.montoAporte,
        porcentajeParticipacion: p.porcentajeParticipacion,
        porcentajeUtilidad: p.porcentajeUtilidad,
      })),
    });
  } catch (error) {
    console.error("Error al actualizar participantes de inversión:", error);
    return NextResponse.json(
      { message: "Error al actualizar participantes" },
      { status: 500 }
    );
  }
}
