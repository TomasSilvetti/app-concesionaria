import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        Client: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userResponse = {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      activo: user.activo,
      cliente: user.Client,
    };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    return NextResponse.json(
      { message: "Error al obtener perfil de usuario" },
      { status: 500 }
    );
  }
}
