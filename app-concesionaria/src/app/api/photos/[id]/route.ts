import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de foto requerido" },
        { status: 400 }
      );
    }

    const photo = await prisma.vehiclePhoto.findUnique({
      where: { id },
      include: {
        Vehicle: {
          select: {
            clienteId: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { message: "Foto no encontrada" },
        { status: 404 }
      );
    }

    if (photo.Vehicle.clienteId !== session.user.clienteId) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 403 }
      );
    }

    return new NextResponse(photo.datos, {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
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
