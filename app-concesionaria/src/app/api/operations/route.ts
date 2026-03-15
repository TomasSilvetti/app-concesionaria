import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const ALLOWED_SORT_FIELDS = [
  "fechaInicio",
  "fechaVenta",
  "modelo",
  "anio",
  "marca",
  "estado",
  "precioVentaTotal",
  "ingresosNetos",
] as const;

const VALID_OPERATION_TYPES = [
  "Venta desde stock",
  "Venta con toma de usado",
  "Venta 0km",
  "A conseguir",
] as const;

type SortField = typeof ALLOWED_SORT_FIELDS[number];
type SortOrder = "asc" | "desc";

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
    const sortBy = searchParams.get("sortBy") as SortField | null;
    const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    
    const estado = searchParams.get("estado");
    const fechaDesde = searchParams.get("fechaDesde");
    const fechaHasta = searchParams.get("fechaHasta");
    const marcaId = searchParams.get("marcaId");
    const tipoOperacionId = searchParams.get("tipoOperacionId");

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json(
        { 
          message: `Campo de ordenamiento inválido. Campos permitidos: ${ALLOWED_SORT_FIELDS.join(", ")}` 
        },
        { status: 400 }
      );
    }

    const ALLOWED_ESTADOS = ["abierta", "cerrada", "cancelada"];
    if (estado && !ALLOWED_ESTADOS.includes(estado)) {
      return NextResponse.json(
        { 
          message: `Estado inválido. Estados permitidos: ${ALLOWED_ESTADOS.join(", ")}` 
        },
        { status: 400 }
      );
    }

    if (fechaDesde) {
      const parsedFechaDesde = new Date(fechaDesde);
      if (isNaN(parsedFechaDesde.getTime())) {
        return NextResponse.json(
          { message: "fechaDesde debe ser una fecha válida en formato ISO" },
          { status: 400 }
        );
      }
    }

    if (fechaHasta) {
      const parsedFechaHasta = new Date(fechaHasta);
      if (isNaN(parsedFechaHasta.getTime())) {
        return NextResponse.json(
          { message: "fechaHasta debe ser una fecha válida en formato ISO" },
          { status: 400 }
        );
      }
    }

    let limit = 20;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { message: "El parámetro limit debe ser un número positivo" },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 100);
    }

    const orderByField = sortBy || "fechaInicio";
    let orderBy: any;

    if (orderByField === "marca") {
      orderBy = {
        VehicleBrand: {
          nombre: sortOrder,
        },
      };
    } else if (orderByField === "modelo") {
      orderBy = {
        VehiculoVendido: {
          modelo: sortOrder,
        },
      };
    } else if (orderByField === "anio") {
      orderBy = {
        VehiculoVendido: {
          anio: sortOrder,
        },
      };
    } else {
      orderBy = {
        [orderByField]: sortOrder,
      };
    }

    const where: any = {
      clienteId: clienteId,
      idOperacion: {
        not: {
          contains: "-INT-",
        },
      },
    };

    if (cursor) {
      where.idOperacion = {
        ...where.idOperacion,
        gt: cursor,
      };
    }

    if (estado) {
      where.estado = estado;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {};
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta);
      }
    }

    if (marcaId) {
      where.marcaId = marcaId;
    }

    if (tipoOperacionId) {
      where.tipoOperacionId = tipoOperacionId;
    }

    const operations = await prisma.operation.findMany({
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
        OperationType: {
          select: {
            nombre: true,
          },
        },
        VehiculoVendido: {
          include: {
            VehicleBrand: true,
            VehicleCategory: true,
            VehiclePhoto: {
              orderBy: {
                orden: 'asc',
              },
            },
          },
        },
      },
      orderBy,
      take: limit + 1,
    });

    const hasMore = operations.length > limit;
    const operationsToReturn = hasMore ? operations.slice(0, limit) : operations;
    const nextCursor = hasMore && operationsToReturn.length > 0
      ? operationsToReturn[operationsToReturn.length - 1].idOperacion
      : null;

    const operationsFormatted = operationsToReturn.map((op) => ({
      idOperacion: op.idOperacion,
      fechaInicio: op.fechaInicio,
      fechaVenta: op.fechaVenta,
      modelo: op.VehiculoVendido.modelo,
      anio: op.VehiculoVendido.anio,
      patente: op.VehiculoVendido.patente,
      precioVentaTotal: op.precioVentaTotal,
      ingresosNetos: op.ingresosNetos,
      estado: op.estado,
      marcaNombre: op.VehicleBrand.nombre,
      categoriaNombre: op.VehicleCategory.nombre,
      tipoOperacionNombre: op.OperationType.nombre,
    }));

    return NextResponse.json({ 
      operations: operationsFormatted,
      nextCursor,
      hasMore,
    }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener operaciones:", error);
    return NextResponse.json(
      { message: "Error al obtener operaciones" },
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
    
    const tipoOperacionId = formData.get("tipoOperacionId") as string;
    const fechaInicioStr = formData.get("fechaInicio") as string;
    const precioVentaTotalStr = formData.get("precioVentaTotal") as string;
    const ingresosBrutosStr = formData.get("ingresosBrutos") as string;
    const vehiculoUsadoStr = formData.get("vehiculoUsado") as string | null;

    const errors: string[] = [];

    if (!marcaId) errors.push("marcaId es requerido");
    if (!modelo) errors.push("modelo es requerido");
    if (!anioStr) errors.push("anio es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (!version) errors.push("version es requerida");
    if (!color) errors.push("color es requerido");
    if (!kilometrosStr) errors.push("kilometros es requerido");
    if (!precioRevistaStr) errors.push("precioRevista es requerido");
    
    if (!tipoOperacionId) errors.push("tipoOperacionId es requerido");
    if (!fechaInicioStr) errors.push("fechaInicio es requerido");
    if (!precioVentaTotalStr) errors.push("precioVentaTotal es requerido");
    if (!ingresosBrutosStr) errors.push("ingresosBrutos es requerido");

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
    const precioVentaTotal = parseFloat(precioVentaTotalStr);
    const ingresosBrutos = parseFloat(ingresosBrutosStr);

    const parsedFechaInicio = new Date(fechaInicioStr);
    if (isNaN(parsedFechaInicio.getTime())) {
      return NextResponse.json(
        { message: "fechaInicio debe ser una fecha válida" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(anio) || anio < 1900 || anio > currentYear + 1) {
      return NextResponse.json(
        { message: `anio debe ser un número entre 1900 y ${currentYear + 1}` },
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

    if (isNaN(precioVentaTotal) || precioVentaTotal <= 0) {
      return NextResponse.json(
        { message: "precioVentaTotal debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (isNaN(ingresosBrutos) || ingresosBrutos <= 0) {
      return NextResponse.json(
        { message: "ingresosBrutos debe ser un número positivo" },
        { status: 400 }
      );
    }

    const [marca, categoria, tipoOperacion] = await Promise.all([
      prisma.vehicleBrand.findFirst({
        where: { id: marcaId, clienteId },
      }),
      prisma.vehicleCategory.findFirst({
        where: { id: categoriaId, clienteId },
      }),
      prisma.operationType.findFirst({
        where: { id: tipoOperacionId, clienteId },
      }),
    ]);

    if (!marca) {
      return NextResponse.json(
        { message: "marcaId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }

    if (!categoria) {
      return NextResponse.json(
        { message: "categoriaId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }

    if (!tipoOperacion) {
      return NextResponse.json(
        { message: "tipoOperacionId no existe o no pertenece al cliente" },
        { status: 400 }
      );
    }

    if (!VALID_OPERATION_TYPES.includes(tipoOperacion.nombre as any)) {
      return NextResponse.json(
        { message: "Tipo de operación inválido" },
        { status: 400 }
      );
    }

    if (tipoOperacion.nombre === "Venta con toma de usado" && !vehiculoUsadoStr) {
      return NextResponse.json(
        { message: "Debés añadir el vehículo usado antes de guardar esta operación" },
        { status: 400 }
      );
    }

    let vehiculoUsado: Record<string, string> | null = null;

    if (vehiculoUsadoStr) {
      try {
        vehiculoUsado = JSON.parse(vehiculoUsadoStr);
      } catch {
        return NextResponse.json(
          { message: "El formato del vehículo usado es inválido" },
          { status: 400 }
        );
      }

      if (!vehiculoUsado?.marcaId || !vehiculoUsado?.modelo || !vehiculoUsado?.anio) {
        return NextResponse.json(
          { message: "El vehículo usado debe tener marcaId, modelo y anio" },
          { status: 400 }
        );
      }
    }

    const lastOperation = await prisma.operation.findFirst({
      where: { 
        clienteId,
        idOperacion: {
          startsWith: `OP-${currentYear}-`,
          not: {
            contains: "-INT-",
          },
        },
      },
      orderBy: { idOperacion: "desc" },
      select: { idOperacion: true },
    });

    let nextIdOperacion = `OP-${currentYear}-001`;
    if (lastOperation) {
      const parts = lastOperation.idOperacion.split("-");
      const lastNumber = parseInt(parts[2], 10);
      const nextNumber = lastNumber + 1;
      nextIdOperacion = `OP-${currentYear}-${nextNumber.toString().padStart(3, "0")}`;
    }

    const gastosAsociados = 0;
    const ingresosNetos = ingresosBrutos - gastosAsociados;
    const comision = precioVentaTotal > 0 ? (ingresosNetos / precioVentaTotal) * 100 : 0;

    const operationId = randomUUID();
    const vehicleId = randomUUID();
    const now = new Date();

    const fotos = formData.getAll("fotos") as File[];
    
    if (fotos.length > 0) {
      const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const MAX_FILE_SIZE = 10 * 1024 * 1024;

      for (const foto of fotos) {
        if (!ALLOWED_MIME_TYPES.includes(foto.type)) {
          return NextResponse.json(
            { message: `Tipo de archivo no permitido: ${foto.type}. Solo se permiten imágenes JPEG, PNG y WebP` },
            { status: 400 }
          );
        }

        if (foto.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { message: `El archivo ${foto.name} excede el tamaño máximo permitido de 10MB` },
            { status: 400 }
          );
        }
      }
    }

    const newOperation = await prisma.$transaction(async (tx) => {
      const newVehicle = await tx.vehicle.create({
        data: {
          id: vehicleId,
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
          estado: "en_proceso",
          actualizadoEn: now,
        },
      });

      if (fotos.length > 0) {
        const photosData = await Promise.all(
          fotos.map(async (foto, index) => {
            const buffer = await foto.arrayBuffer();
            const bytes = Buffer.from(buffer);

            return {
              id: randomUUID(),
              stockId: vehicleId,
              nombreArchivo: foto.name,
              mimeType: foto.type,
              datos: bytes,
              orden: index,
              creadoEn: now,
            };
          })
        );

        await tx.vehiclePhoto.createMany({
          data: photosData,
        });
      }

      const operation = await tx.operation.create({
        data: {
          id: operationId,
          idOperacion: nextIdOperacion,
          clienteId,
          fechaInicio: parsedFechaInicio,
          vehiculoVendidoId: vehicleId,
          precioVentaTotal,
          ingresosBrutos,
          gastosAsociados,
          ingresosNetos,
          comision,
          estado: "abierta",
          marcaId,
          categoriaId,
          tipoOperacionId,
          actualizadoEn: now,
        },
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
          OperationType: {
            select: {
              nombre: true,
            },
          },
          VehiculoVendido: {
            select: {
              modelo: true,
              anio: true,
              patente: true,
              version: true,
              color: true,
              kilometros: true,
              notasMecanicas: true,
              notasGenerales: true,
              precioRevista: true,
              precioOferta: true,
            },
          },
        },
      });

      if (vehiculoUsado) {
        const usedVehicleId = randomUUID();
        const usedVehicleAnio = parseInt(vehiculoUsado.anio, 10);
        const usedVehicleKilometros = vehiculoUsado.kilometros
          ? parseInt(vehiculoUsado.kilometros, 10)
          : null;
        const usedVehiclePrecioRevista = vehiculoUsado.precioRevista
          ? parseFloat(vehiculoUsado.precioRevista)
          : null;
        const usedVehiclePrecioNegociado = vehiculoUsado.precioNegociado
          ? parseFloat(vehiculoUsado.precioNegociado)
          : null;

        await tx.vehicle.create({
          data: {
            id: usedVehicleId,
            clienteId,
            operacionId: operationId,
            marcaId: vehiculoUsado.marcaId,
            modelo: vehiculoUsado.modelo,
            anio: usedVehicleAnio,
            categoriaId: vehiculoUsado.categoriaId || categoriaId,
            patente: vehiculoUsado.patente || null,
            version: vehiculoUsado.version || null,
            color: vehiculoUsado.color || null,
            kilometros: usedVehicleKilometros,
            notasMecanicas: vehiculoUsado.notasMecanicas || null,
            notasGenerales: vehiculoUsado.notasGenerales || null,
            precioRevista: usedVehiclePrecioRevista,
            estado: "disponible",
            actualizadoEn: now,
          },
        });

        await tx.operationExchange.create({
          data: {
            id: randomUUID(),
            operacionId: operationId,
            stockId: usedVehicleId,
            precioNegociado: usedVehiclePrecioNegociado,
            actualizadoEn: now,
          },
        });
      }

      return operation;
    });

    return NextResponse.json(
      {
        operation: {
          id: newOperation.id,
          idOperacion: newOperation.idOperacion,
          fechaInicio: newOperation.fechaInicio,
          modelo: newOperation.VehiculoVendido.modelo,
          anio: newOperation.VehiculoVendido.anio,
          patente: newOperation.VehiculoVendido.patente,
          version: newOperation.VehiculoVendido.version,
          color: newOperation.VehiculoVendido.color,
          kilometros: newOperation.VehiculoVendido.kilometros,
          notasMecanicas: newOperation.VehiculoVendido.notasMecanicas,
          notasGenerales: newOperation.VehiculoVendido.notasGenerales,
          precioRevista: newOperation.VehiculoVendido.precioRevista,
          precioOferta: newOperation.VehiculoVendido.precioOferta,
          precioVentaTotal: newOperation.precioVentaTotal,
          ingresosBrutos: newOperation.ingresosBrutos,
          gastosAsociados: newOperation.gastosAsociados,
          ingresosNetos: newOperation.ingresosNetos,
          comision: newOperation.comision,
          estado: newOperation.estado,
          marcaNombre: newOperation.VehicleBrand.nombre,
          categoriaNombre: newOperation.VehicleCategory.nombre,
          tipoOperacionNombre: newOperation.OperationType.nombre,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear operación:", error);
    return NextResponse.json(
      { message: "Error al crear operación" },
      { status: 500 }
    );
  }
}
