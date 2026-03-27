import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden ver asignaciones." },
        { status: 403 }
      );
    }

    const { id: templateId } = await params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
      select: { id: true },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const [clients, existingAssignments] = await Promise.all([
      prisma.client.findMany({
        where: { activo: true },
        select: { id: true, nombre: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.documentAssignment.findMany({
        where: { templateId },
        select: { clienteId: true, activo: true },
      }),
    ]);

    const assignmentMap = new Map(
      existingAssignments.map((a) => [a.clienteId, a.activo])
    );

    const assignments = clients.map((client) => ({
      clienteId: client.id,
      nombre: client.nombre,
      activo: assignmentMap.get(client.id) ?? false,
    }));

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);
    return NextResponse.json(
      { message: "Error al obtener asignaciones" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden modificar asignaciones." },
        { status: 403 }
      );
    }

    const { id: templateId } = await params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id: templateId },
      select: { id: true },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { assignments } = body as {
      assignments: { clienteId: string; activo: boolean }[];
    };

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { message: "El campo 'assignments' debe ser un array" },
        { status: 400 }
      );
    }

    const now = new Date();

    await prisma.$transaction(
      assignments.map(({ clienteId, activo }) =>
        prisma.documentAssignment.upsert({
          where: { templateId_clienteId: { templateId, clienteId } },
          update: { activo, actualizadoEn: now },
          create: {
            id: crypto.randomUUID(),
            templateId,
            clienteId,
            activo,
            actualizadoEn: now,
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Asignaciones actualizadas correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar asignaciones:", error);
    return NextResponse.json(
      { message: "Error al actualizar asignaciones" },
      { status: 500 }
    );
  }
}
