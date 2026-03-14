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

const ALLOWED_TIPOS_INGRESO = ["compra", "intercambio", "consignacion"];

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
  tipoIngreso?: string;
}

function buildWhereClause(clienteId: string, filters: StockFilters) {
  const where: any = {
    clienteId: clienteId,
  };

  if (filters.tipoIngreso) {
    where.tipoIngreso = filters.tipoIngreso;
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
      tipoIngreso: searchParams.get("tipoIngreso") || undefined,
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

    if (filters.tipoIngreso && !ALLOWED_TIPOS_INGRESO.includes(filters.tipoIngreso)) {
      return NextResponse.json(
        { 
          message: `tipoIngreso inválido. Tipos permitidos: ${ALLOWED_TIPOS_INGRESO.join(", ")}` 
        },
        { status: 400 }
      );
    }

    const where = buildWhereClause(clienteId, filters);
    const orderByClause = buildOrderByClause(orderBy, order);

    const stockVehicles = await prisma.stock.findMany({
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
      },
      orderBy: orderByClause,
    });

    const vehiclesFormatted = stockVehicles.map((stock) => ({
      id: stock.id,
      marca: stock.VehicleBrand?.nombre || "Sin marca",
      modelo: stock.modelo || "Sin modelo",
      anio: stock.anio,
      categoria: stock.VehicleCategory?.nombre || "Sin categoría",
      version: stock.version,
      color: stock.color,
      kilometros: stock.kilometros,
      precioRevista: stock.precioRevista,
      precioOferta: stock.precioOferta,
      tipoIngreso: stock.tipoIngreso,
      operacionId: stock.operacionId,
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
    const tipoIngreso = formData.get("tipoIngreso") as string;
    const precioRevistaStr = formData.get("precioRevista") as string;
    const precioOfertaStr = formData.get("precioOferta") as string | null;
    const notasMecanicas = formData.get("notasMecanicas") as string | null;
    const notasGenerales = formData.get("notasGenerales") as string | null;

    const errors: string[] = [];

    if (!marcaId) errors.push("marcaId es requerido");
    if (!modelo) errors.push("modelo es requerido");
    if (!anioStr) errors.push("anio es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (!version) errors.push("version es requerida");
    if (!color) errors.push("color es requerido");
    if (!kilometrosStr) errors.push("kilometros es requerido");
    if (!tipoIngreso) errors.push("tipoIngreso es requerido");
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

    const ALLOWED_TIPOS_INGRESO = ["compra", "parte_de_pago", "consignacion"];
    if (!ALLOWED_TIPOS_INGRESO.includes(tipoIngreso)) {
      return NextResponse.json(
        { 
          message: `tipoIngreso inválido. Tipos permitidos: ${ALLOWED_TIPOS_INGRESO.join(", ")}` 
        },
        { status: 400 }
      );
    }

    const stockId = randomUUID();
    const now = new Date();

    const stock = await prisma.stock.create({
      data: {
        id: stockId,
        operacionId: null,
        clienteId,
        marcaId,
        modelo,
        anio,
        categoriaId,
        version,
        color,
        kilometros,
        tipoIngreso,
        notasMecanicas: notasMecanicas || null,
        notasGenerales: notasGenerales || null,
        precioRevista,
        precioOferta,
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
            stockId: stock.id,
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

    const vehicleCreated = await prisma.stock.findUnique({
      where: { id: stock.id },
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
