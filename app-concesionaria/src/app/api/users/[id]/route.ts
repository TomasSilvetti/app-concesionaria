import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
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

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden modificar usuarios." },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await req.json();
    const { activo } = body;

    if (typeof activo !== "boolean") {
      return NextResponse.json(
        { message: "El campo 'activo' es requerido y debe ser un booleano" },
        { status: 400 }
      );
    }

    if (userId === session.user.id && activo === false) {
      return NextResponse.json(
        { message: "No podés desactivarte a vos mismo" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { activo },
      select: {
        id: true,
        username: true,
        nombre: true,
        email: true,
        rol: true,
        clienteId: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
        Client: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (activo === false) {
      console.warn(`Usuario ${userId} (${user.username}) desactivado por admin ${session.user.id}. Sesiones invalidadas.`);
    }

    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      rol: updatedUser.rol,
      clienteId: updatedUser.clienteId,
      clienteNombre: updatedUser.Client?.nombre ?? null,
      activo: updatedUser.activo,
      creadoEn: updatedUser.creadoEn,
      actualizadoEn: updatedUser.actualizadoEn,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
