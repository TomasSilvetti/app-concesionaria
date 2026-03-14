import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
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

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden ver usuarios." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rolFilter = searchParams.get("rol");
    const activoFilter = searchParams.get("activo");

    const where: any = {};

    if (rolFilter && (rolFilter === "admin" || rolFilter === "usuario")) {
      where.rol = rolFilter;
    }

    if (activoFilter !== null && activoFilter !== undefined && activoFilter !== "") {
      where.activo = activoFilter === "true";
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy: {
        creadoEn: "desc",
      },
    });

    const usersWithClientName = users.map((user) => ({
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      clienteId: user.clienteId,
      clienteNombre: user.Client?.nombre ?? null,
      activo: user.activo,
      creadoEn: user.creadoEn,
      actualizadoEn: user.actualizadoEn,
    }));

    return NextResponse.json({ users: usersWithClientName }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
        { message: "Acceso denegado. Solo administradores pueden crear usuarios." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, nombre, password, rol, clienteId } = body;

    if (!username || !nombre || !password || !rol) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (rol !== "admin" && rol !== "usuario") {
      return NextResponse.json(
        { message: "Rol inválido. Debe ser 'admin' o 'usuario'" },
        { status: 400 }
      );
    }

    if (rol === "usuario" && !clienteId) {
      return NextResponse.json(
        { message: "Los usuarios de tipo 'usuario' deben tener un cliente asociado" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "El nombre de usuario ya existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        username,
        nombre,
        password: hashedPassword,
        rol,
        clienteId: rol === "usuario" ? clienteId : null,
        activo: true,
        actualizadoEn: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.id,
          username: newUser.username,
          nombre: newUser.nombre,
          rol: newUser.rol,
          clienteId: newUser.clienteId,
          activo: newUser.activo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
