import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });

    const { id } = await params;
    const documento = await prisma.repositorioDocumento.findFirst({
      where: { id, clienteId },
    });

    if (!documento) return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });

    const headers = new Headers();
    headers.set("Content-Type", documento.mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(documento.nombreOriginal)}"`
    );
    headers.set("Content-Length", documento.tamano.toString());

    return new NextResponse(new Uint8Array(documento.datos), { headers });
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    const clienteId = session.user.clienteId;
    if (!clienteId) return NextResponse.json({ message: "Usuario sin cliente asociado" }, { status: 403 });

    const { id } = await params;
    const documento = await prisma.repositorioDocumento.findFirst({
      where: { id, clienteId },
      select: { id: true },
    });

    if (!documento) return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });

    await prisma.repositorioDocumento.delete({ where: { id } });

    return NextResponse.json({ message: "Documento eliminado" });
  } catch {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
