import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json({ message: "Sin cliente asociado" }, { status: 403 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clienteId },
      select: { id: true, nombre: true, slug: true },
    });

    if (!client) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 });
    }

    if (client.slug) {
      return NextResponse.json({ slug: client.slug });
    }

    // Generate and save slug from nombre
    const base = generateSlug(client.nombre || clienteId);
    let slug = base;
    let attempt = 0;

    // Ensure uniqueness
    while (true) {
      const existing = await prisma.client.findUnique({ where: { slug } });
      if (!existing || existing.id === clienteId) break;
      attempt++;
      slug = `${base}-${attempt}`;
    }

    await prisma.client.update({
      where: { id: clienteId },
      data: { slug },
    });

    return NextResponse.json({ slug });
  } catch (error) {
    console.error("Error al obtener/generar slug:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
