import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ItemReorden {
  id: string;
  orden: number;
}

export async function PATCH(req: NextRequest) {
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Cuerpo JSON inválido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: "Se esperaba un array de { id, orden }" },
        { status: 400 }
      );
    }

    const items = body as ItemReorden[];

    for (const item of items) {
      if (
        !item.id ||
        typeof item.id !== "string" ||
        item.orden === undefined ||
        typeof item.orden !== "number" ||
        !Number.isInteger(item.orden) ||
        item.orden < 0
      ) {
        return NextResponse.json(
          { message: "Cada elemento debe tener id (string) y orden (entero >= 0)" },
          { status: 400 }
        );
      }
    }

    const ids = items.map((i) => i.id);

    const columnas = await prisma.kanbanColumna.findMany({
      where: { id: { in: ids } },
      select: { id: true, clienteId: true },
    });

    if (columnas.length !== ids.length) {
      return NextResponse.json(
        { message: "Una o más columnas no fueron encontradas" },
        { status: 404 }
      );
    }

    const sinPermisos = columnas.some((c) => c.clienteId !== clienteId);
    if (sinPermisos) {
      return NextResponse.json(
        { message: "Sin permisos sobre una o más columnas" },
        { status: 403 }
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.kanbanColumna.update({
          where: { id: item.id },
          data: { orden: item.orden },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al reordenar columnas:", error);
    return NextResponse.json(
      { message: "Error al reordenar columnas" },
      { status: 500 }
    );
  }
}
