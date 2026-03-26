import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const vehicleInclude = {
  VehicleBrand: {
    select: { nombre: true },
  },
  VehicleCategory: {
    select: { nombre: true },
  },
  VehiclePhoto: {
    select: { id: true, nombreArchivo: true, orden: true },
    orderBy: { orden: "asc" as const },
  },
  Operation: {
    select: {
      idOperacion: true,
      VehiculoVendido: {
        select: {
          VehicleBrand: { select: { nombre: true } },
          modelo: true,
          patente: true,
        },
      },
    },
  },
  OperacionesVenta: {
    select: { idOperacion: true },
    take: 1,
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      where: { id: id },
      include: vehicleInclude,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.clienteId !== clienteId) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    const { Operation, OperacionesVenta, ...vehicleRest } = vehicle;
    const response = {
      ...vehicleRest,
      operacion: Operation
        ? {
            idOperacion: Operation.idOperacion,
            vehiculoVendido: Operation.VehiculoVendido
              ? {
                  marca: Operation.VehiculoVendido.VehicleBrand?.nombre ?? "",
                  modelo: Operation.VehiculoVendido.modelo,
                  patente: Operation.VehiculoVendido.patente,
                }
              : null,
          }
        : null,
      operacionDeVenta: OperacionesVenta[0]
        ? { idOperacion: OperacionesVenta[0].idOperacion }
        : null,
    };

    return NextResponse.json({ vehicle: response }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    return NextResponse.json(
      { message: "Error al obtener vehículo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      include: {
        Operation: {
          select: { idOperacion: true },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (vehicle.clienteId !== clienteId) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    if (vehicle.operacionId !== null) {
      const idOperacion = vehicle.Operation?.idOperacion ?? vehicle.operacionId;
      return NextResponse.json(
        {
          message: `Este vehículo está asociado a la operación ${idOperacion}. Primero debes desvincularlo desde la edición de la operación`,
        },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json(
      { message: "Vehículo eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    return NextResponse.json(
      { message: "Error al eliminar vehículo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const existing = await prisma.vehicle.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    if (existing.clienteId !== clienteId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();

    const marcaId = formData.get("marcaId") as string;
    const modelo = formData.get("modelo") as string;
    const anioStr = formData.get("anio") as string;
    const categoriaId = formData.get("categoriaId") as string;
    const version = formData.get("version") as string;
    const color = formData.get("color") as string;
    const kilometrosStr = formData.get("kilometros") as string;
    const precioRevistaStr = formData.get("precioRevista") as string;
    const precioOfertaStr = formData.get("precioOferta") as string | null;
    const precioTomaStr = formData.get("precioToma") as string | null;
    const notasMecanicas = formData.get("notasMecanicas") as string | null;
    const notasGenerales = formData.get("notasGenerales") as string | null;
    const patente = formData.get("patente") as string | null;

    const errors: string[] = [];

    if (!marcaId) errors.push("marcaId es requerido");
    if (!modelo) errors.push("modelo es requerido");
    if (!anioStr) errors.push("anio es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (!version) errors.push("version es requerida");
    if (!color) errors.push("color es requerido");
    if (!kilometrosStr) errors.push("kilometros es requerido");
    if (!precioRevistaStr) errors.push("precioRevista es requerido");

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Errores de validación", errors },
        { status: 400 }
      );
    }

    const anio = parseInt(anioStr, 10);
    const kilometros = parseInt(kilometrosStr, 10);
    const precioRevista = parseFloat(precioRevistaStr);
    const precioOferta = precioOfertaStr ? parseFloat(precioOfertaStr) : null;
    const precioToma = precioTomaStr ? parseFloat(precioTomaStr) : null;

    if (isNaN(anio) || anio < 1900 || anio > 2100) {
      return NextResponse.json(
        { message: "anio debe estar entre 1900 y 2100" },
        { status: 400 }
      );
    }

    if (isNaN(kilometros) || kilometros < 0) {
      return NextResponse.json(
        { message: "kilometros debe ser un número positivo o cero" },
        { status: 400 }
      );
    }

    if (isNaN(precioRevista) || precioRevista <= 0) {
      return NextResponse.json(
        { message: "precioRevista debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (precioOferta !== null && (isNaN(precioOferta) || precioOferta <= 0)) {
      return NextResponse.json(
        { message: "precioOferta debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (precioToma !== null && (isNaN(precioToma) || precioToma <= 0)) {
      return NextResponse.json(
        { message: "precioToma debe ser un número positivo" },
        { status: 400 }
      );
    }

    const fotos = formData.getAll("fotos") as File[];
    if (fotos.length > 0) {
      const existingCount = await prisma.vehiclePhoto.count({ where: { stockId: id } });
      if (existingCount + fotos.length > 10) {
        return NextResponse.json(
          { message: "No se pueden cargar más de 10 fotos por vehículo" },
          { status: 400 }
        );
      }
    }

    const fotoReordenRaw = formData.get("foto_reorden") as string | null;
    const fotoReorden: string[] = fotoReordenRaw
      ? (JSON.parse(fotoReordenRaw) as string[])
      : [];

    const now = new Date();

    const vehicle = await prisma.vehicle.update({
      where: { id: id },
      data: {
        marcaId,
        modelo,
        anio,
        categoriaId,
        patente: patente || null,
        version,
        color,
        kilometros,
        notasMecanicas: notasMecanicas || null,
        notasGenerales: notasGenerales || null,
        precioRevista,
        precioOferta,
        precioToma,
        actualizadoEn: now,
      },
      include: vehicleInclude,
    });

    if (fotoReorden.length > 0) {
      await Promise.all(
        fotoReorden.map((photoId, index) =>
          prisma.vehiclePhoto.updateMany({
            where: { id: photoId, stockId: id },
            data: { orden: index },
          })
        )
      );
    }

    if (fotos.length > 0) {
      const photosData = await Promise.all(
        fotos.map(async (foto, index) => {
          const buffer = await foto.arrayBuffer();
          const bytes = Buffer.from(buffer);

          return {
            id: randomUUID(),
            stockId: vehicle.id,
            nombreArchivo: foto.name,
            mimeType: foto.type,
            datos: bytes,
            orden: fotoReorden.length + index,
            creadoEn: now,
          };
        })
      );

      await prisma.vehiclePhoto.createMany({
        data: photosData,
      });
    }

    return NextResponse.json(
      { message: "Vehículo actualizado exitosamente", vehicle },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return NextResponse.json(
      { message: "Error al actualizar vehículo" },
      { status: 500 }
    );
  }
}
