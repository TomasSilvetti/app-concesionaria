import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { id, photoId } = await params;
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

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { clienteId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.clienteId !== clienteId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const photo = await prisma.vehiclePhoto.findUnique({
      where: { id: photoId },
      select: { datos: true, mimeType: true, nombreArchivo: true },
    });

    if (!photo) {
      return NextResponse.json(
        { message: "Foto no encontrada" },
        { status: 404 }
      );
    }

    return new NextResponse(photo.datos, {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Disposition": `inline; filename="${photo.nombreArchivo}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al obtener foto:", error);
    return NextResponse.json(
      { message: "Error al obtener foto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const { id, photoId } = await params;
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

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { clienteId: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.clienteId !== clienteId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const photo = await prisma.vehiclePhoto.findUnique({
      where: { id: photoId },
      select: { id: true },
    });

    if (!photo) {
      return NextResponse.json(
        { message: "Foto no encontrada" },
        { status: 404 }
      );
    }

    await prisma.vehiclePhoto.delete({ where: { id: photoId } });

    return NextResponse.json(
      { message: "Foto eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    return NextResponse.json(
      { message: "Error al eliminar foto" },
      { status: 500 }
    );
  }
}
