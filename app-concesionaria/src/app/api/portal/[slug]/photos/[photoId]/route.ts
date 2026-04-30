import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  try {
    const { slug, photoId } = await params;

    const client = await prisma.client.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ message: "Empresa no encontrada" }, { status: 404 });
    }

    const photo = await prisma.vehiclePhoto.findUnique({
      where: { id: photoId },
      select: { datos: true, datosThumb: true, mimeType: true, nombreArchivo: true, stockId: true },
    });

    if (!photo) {
      return NextResponse.json({ message: "Foto no encontrada" }, { status: 404 });
    }

    // Verify photo belongs to this client
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: photo.stockId },
      select: { clienteId: true },
    });

    if (!vehicle || vehicle.clienteId !== client.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const thumb = req.nextUrl.searchParams.get("thumb") === "true";
    const imageData = thumb && photo.datosThumb ? photo.datosThumb : photo.datos;

    return new NextResponse(new Uint8Array(imageData), {
      status: 200,
      headers: {
        "Content-Type": photo.mimeType,
        "Content-Disposition": `inline; filename="${photo.nombreArchivo}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error al obtener foto del portal:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
