import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        clienteId,
        operacionId: null,
        estado: "disponible",
      },
      include: {
        VehicleBrand: {
          select: {
            nombre: true,
          },
        },
        VehiclePhoto: {
          select: {
            id: true,
          },
          orderBy: {
            orden: "asc",
          },
        },
      },
      orderBy: {
        creadoEn: "desc",
      },
    });

    const vehiclesFormatted = vehicles.map((vehicle) => ({
      id: vehicle.id,
      marca: vehicle.VehicleBrand?.nombre ?? "Sin marca",
      modelo: vehicle.modelo ?? "",
      anio: vehicle.anio,
      patente: vehicle.patente,
      categoriaId: vehicle.categoriaId,
      version: vehicle.version,
      color: vehicle.color,
      km: vehicle.kilometros,
      notasMecanicas: vehicle.notasMecanicas,
      notasGenerales: vehicle.notasGenerales,
      precioRevista: vehicle.precioRevista,
      precioOferta: vehicle.precioOferta,
      fotos: vehicle.VehiclePhoto.map((p) => ({ id: p.id })),
    }));

    return NextResponse.json({ vehicles: vehiclesFormatted }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener vehículos disponibles:", error);
    return NextResponse.json(
      { message: "Error al obtener vehículos disponibles" },
      { status: 500 }
    );
  }
}
