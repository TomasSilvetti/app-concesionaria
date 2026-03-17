import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const ALLOWED_ORDER_BY_FIELDS = [
  "marca",
  "modelo",
  "version",
  "color",
  "kilometros",
  "precioRevista",
  "precioOferta",
] as const;

type OrderByField = typeof ALLOWED_ORDER_BY_FIELDS[number];
type Order = "asc" | "desc";

interface StockFilters {
  marca?: string;
  marcaId?: string;
  categoria?: string;
  categoriaId?: string;
  precioMin?: string;
  precioMax?: string;
  anio?: string;
  kilometrosMax?: string;
  mostrarConOperacion?: boolean;
}

function buildWhereClause(clienteId: string, filters: StockFilters) {
  const where: any = {
    clienteId: clienteId,
  };

  if (filters.mostrarConOperacion) {
    where.estado = { in: ["disponible", "en_proceso"] };
  } else {
    where.estado = "disponible";
  }

  if (filters.precioMin || filters.precioMax) {
    where.OR = [
      {
        precioRevista: {
          ...(filters.precioMin && { gte: parseFloat(filters.precioMin) }),
          ...(filters.precioMax && { lte: parseFloat(filters.precioMax) }),
        },
      },
      {
        precioOferta: {
          ...(filters.precioMin && { gte: parseFloat(filters.precioMin) }),
          ...(filters.precioMax && { lte: parseFloat(filters.precioMax) }),
        },
      },
    ];
  }

  if (filters.kilometrosMax) {
    where.kilometros = {
      lte: parseInt(filters.kilometrosMax, 10),
    };
  }

  if (filters.anio) {
    where.anio = parseInt(filters.anio, 10);
  }

  if (filters.marcaId) {
    where.marcaId = filters.marcaId;
  } else if (filters.marca) {
    where.VehicleBrand = {
      nombre: {
        contains: filters.marca,
        mode: 'insensitive',
      },
    };
  }

  if (filters.categoriaId) {
    where.categoriaId = filters.categoriaId;
  } else if (filters.categoria) {
    where.VehicleCategory = {
      nombre: {
        contains: filters.categoria,
        mode: 'insensitive',
      },
    };
  }

  return where;
}

function buildOrderByClause(orderBy: OrderByField | null, order: Order) {
  if (!orderBy) {
    return {
      creadoEn: "desc",
    };
  }

  if (orderBy === "marca") {
    return {
      VehicleBrand: {
        nombre: order,
      },
    };
  }

  if (orderBy === "modelo") {
    return {
      modelo: order,
    };
  }

  return {
    [orderBy]: order,
  };
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const orderBy = searchParams.get("orderBy") as OrderByField | null;
    const order = (searchParams.get("order") as Order) || "asc";
    
    const filters: StockFilters = {
      marca: searchParams.get("marca") || undefined,
      marcaId: searchParams.get("marcaId") || undefined,
      categoria: searchParams.get("categoria") || undefined,
      categoriaId: searchParams.get("categoriaId") || undefined,
      precioMin: searchParams.get("precioMin") || undefined,
      precioMax: searchParams.get("precioMax") || undefined,
      anio: searchParams.get("anio") || undefined,
      kilometrosMax: searchParams.get("kilometrosMax") || undefined,
      mostrarConOperacion: searchParams.get("mostrarConOperacion") === "true",
    };

    if (orderBy && !ALLOWED_ORDER_BY_FIELDS.includes(orderBy)) {
      return NextResponse.json(
        { 
          message: `Campo de ordenamiento inválido. Campos permitidos: ${ALLOWED_ORDER_BY_FIELDS.join(", ")}` 
        },
        { status: 400 }
      );
    }

    if (filters.precioMin) {
      const parsedPrecioMin = parseFloat(filters.precioMin);
      if (isNaN(parsedPrecioMin) || parsedPrecioMin < 0) {
        return NextResponse.json(
          { message: "precioMin debe ser un número positivo o cero" },
          { status: 400 }
        );
      }
    }

    if (filters.precioMax) {
      const parsedPrecioMax = parseFloat(filters.precioMax);
      if (isNaN(parsedPrecioMax) || parsedPrecioMax < 0) {
        return NextResponse.json(
          { message: "precioMax debe ser un número positivo o cero" },
          { status: 400 }
        );
      }
    }

    if (filters.anio) {
      const parsedAnio = parseInt(filters.anio, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(parsedAnio) || parsedAnio < 1900 || parsedAnio > currentYear + 1) {
        return NextResponse.json(
          { message: `anio debe ser un número entre 1900 y ${currentYear + 1}` },
          { status: 400 }
        );
      }
    }

    if (filters.kilometrosMax) {
      const parsedKilometrosMax = parseInt(filters.kilometrosMax, 10);
      if (isNaN(parsedKilometrosMax) || parsedKilometrosMax < 0) {
        return NextResponse.json(
          { message: "kilometrosMax debe ser un número positivo o cero" },
          { status: 400 }
        );
      }
    }

    const where = buildWhereClause(clienteId, filters);
    const orderByClause = buildOrderByClause(orderBy, order);

    const stockVehicles = await prisma.vehicle.findMany({
      where,
      include: {
        VehicleBrand: {
          select: {
            nombre: true,
          },
        },
        VehicleCategory: {
          select: {
            nombre: true,
          },
        },
        Operation: {
          select: {
            idOperacion: true,
          },
        },
      },
      orderBy: orderByClause,
    });

    const vehiclesFormatted = stockVehicles.map((vehicle) => ({
      id: vehicle.id,
      marca: vehicle.VehicleBrand?.nombre || "Sin marca",
      modelo: vehicle.modelo || "Sin modelo",
      anio: vehicle.anio,
      categoria: vehicle.VehicleCategory?.nombre || "Sin categoría",
      version: vehicle.version,
      color: vehicle.color,
      kilometros: vehicle.kilometros,
      precioRevista: vehicle.precioRevista,
      precioOferta: vehicle.precioOferta,
      operacionId: vehicle.operacionId,
      idOperacion: vehicle.Operation?.idOperacion ?? null,
      estado: vehicle.estado,
    }));

    return NextResponse.json({ 
      vehicles: vehiclesFormatted,
    }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener stock:", error);
    return NextResponse.json(
      { message: "Error al obtener stock" },
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

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
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

    const vehicleId = randomUUID();
    const now = new Date();

    const vehicle = await prisma.vehicle.create({
      data: {
        id: vehicleId,
        operacionId: null,
        clienteId,
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
        estado: "disponible",
        creadoEn: now,
        actualizadoEn: now,
      },
    });

    const fotos = formData.getAll("fotos") as File[];
    
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
            orden: index,
            creadoEn: now,
          };
        })
      );

      await prisma.vehiclePhoto.createMany({
        data: photosData,
      });
    }

    const vehicleCreated = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        VehicleBrand: {
          select: {
            nombre: true,
          },
        },
        VehicleCategory: {
          select: {
            nombre: true,
          },
        },
        VehiclePhoto: {
          select: {
            id: true,
            nombreArchivo: true,
            orden: true,
          },
          orderBy: {
            orden: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Vehículo creado exitosamente",
        vehicle: vehicleCreated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return NextResponse.json(
      { message: "Error al crear vehículo" },
      { status: 500 }
    );
  }
}
