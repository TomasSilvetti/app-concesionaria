import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const client = await prisma.client.findUnique({
      where: { slug },
      select: { id: true, nombre: true, logo: true, activo: true },
    });

    if (!client || !client.activo) {
      return NextResponse.json({ message: "Empresa no encontrada" }, { status: 404 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        clienteId: client.id,
        estado: "disponible",
      },
      include: {
        VehicleBrand: { select: { nombre: true } },
        VehicleCategory: { select: { nombre: true } },
        VehiclePhoto: {
          select: { id: true },
          orderBy: { orden: "asc" },
          take: 1,
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    const formatted = vehicles.map((v) => ({
      id: v.id,
      marca: v.VehicleBrand?.nombre ?? "Sin marca",
      modelo: v.modelo ?? "",
      anio: v.anio,
      patente: v.patente,
      version: v.version,
      color: v.color,
      kilometros: v.kilometros,
      categoria: v.VehicleCategory?.nombre ?? "",
      notasGenerales: v.notasGenerales,
      fotoId: v.VehiclePhoto[0]?.id ?? null,
    }));

    return NextResponse.json({
      empresa: { nombre: client.nombre, logo: client.logo ?? null },
      vehicles: formatted,
    });
  } catch (error) {
    console.error("Error en portal:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
