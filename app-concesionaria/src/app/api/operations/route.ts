import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { isValidOperationTypeName } from "@/lib/operation-types";
import { calcularIngresosNetos, calcularComision } from "@/lib/calculations";
import { processVehiclePhoto, ImageTooSmallError } from "@/lib/imageProcessor";

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
    const tipoOperacion = searchParams.get("tipoOperacion");

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

    if (tipoOperacion) {
      where.tipoOperacion = tipoOperacion;
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
        Pago: {
          select: {
            monto: true,
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

    const operationsFormatted = operationsToReturn.map((op) => {
      const saldado = op.Pago.reduce((sum, p) => sum + p.monto, 0);
      return {
        idOperacion: op.idOperacion,
        nombreComprador: op.nombreComprador,
        fechaInicio: op.fechaInicio,
        fechaVenta: op.fechaVenta,
        modelo: op.VehiculoVendido.modelo,
        anio: op.VehiculoVendido.anio,
        patente: op.VehiculoVendido.patente,
        precioVentaTotal: op.precioVentaTotal,
        saldado,
        ingresosNetos: op.ingresosNetos,
        estado: op.estado,
        marcaNombre: op.VehicleBrand.nombre,
        categoriaNombre: op.VehicleCategory.nombre,
        tipoOperacionNombre: op.tipoOperacion,
        vehiculoId: op.vehiculoVendidoId,
        vehiculoFotoId: op.VehiculoVendido.VehiclePhoto[0]?.id ?? null,
      };
    });

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
    
    const nombreComprador = formData.get("nombreComprador") as string;

    const tipoOperacion = formData.get("tipoOperacion") as string;
    const fechaInicioStr = formData.get("fechaInicio") as string;
    const precioVentaTotalStr = formData.get("precioVentaTotal") as string;
    const ingresosBrutosStr = formData.get("ingresosBrutos") as string;
    const precioTomaStr = formData.get("precioToma") as string | null;
    const vehiculosUsadosStr = formData.get("vehiculosUsados") as string | null;
    const stockVehicleId = formData.get("stockVehicleId") as string | null;
    const documentoDetalle = formData.get("documentoDetalle") as File | null;
    const inversionStr = formData.get("inversion") as string | null;

    const errors: string[] = [];

    if (!marcaId) errors.push("marcaId es requerido");
    if (!modelo) errors.push("modelo es requerido");
    if (!anioStr) errors.push("anio es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (!version) errors.push("version es requerida");
    if (!color) errors.push("color es requerido");
    if (!kilometrosStr) errors.push("kilometros es requerido");
    if (!precioRevistaStr) errors.push("precioRevista es requerido");
    
    if (!nombreComprador || !nombreComprador.trim()) errors.push("nombreComprador es requerido");
    if (!tipoOperacion) errors.push("tipoOperacion es requerido");
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
    const precioToma = precioTomaStr ? parseFloat(precioTomaStr) : null;

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

    if (!isValidOperationTypeName(tipoOperacion)) {
      return NextResponse.json(
        { message: "Tipo de operación inválido" },
        { status: 400 }
      );
    }

    const [marca, categoria] = await Promise.all([
      prisma.vehicleBrand.findFirst({
        where: { id: marcaId, clienteId },
      }),
      prisma.vehicleCategory.findFirst({
        where: { id: categoriaId, clienteId },
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

    if (stockVehicleId) {
      const stockVehicle = await prisma.vehicle.findFirst({
        where: { id: stockVehicleId, clienteId, estado: "disponible" },
      });
      if (!stockVehicle) {
        return NextResponse.json(
          { message: "El vehículo de stock no existe, no está disponible o no pertenece al cliente" },
          { status: 400 }
        );
      }
    }

    let vehiculosUsados: Record<string, string>[] = [];

    if (vehiculosUsadosStr) {
      try {
        const parsed = JSON.parse(vehiculosUsadosStr);
        if (Array.isArray(parsed)) {
          vehiculosUsados = parsed;
        }
      } catch {
        return NextResponse.json(
          { message: "vehiculosUsados tiene formato inválido" },
          { status: 400 }
        );
      }

      for (let i = 0; i < vehiculosUsados.length; i++) {
        const vu = vehiculosUsados[i];
        if (!vu.marcaId || !vu.modelo || !vu.anio) {
          return NextResponse.json(
            { message: `El vehículo en posición ${i} debe tener marcaId, modelo y anio` },
            { status: 400 }
          );
        }
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
    const ingresosNetos = calcularIngresosNetos(ingresosBrutos, gastosAsociados);
    const comision = calcularComision(precioVentaTotal, ingresosNetos);

    const operationId = randomUUID();
    const vehicleId = randomUUID();
    const now = new Date();

    const fotos = formData.getAll("fotos") as File[];

    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ALLOWED_DOC_MIME_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const MAX_DOC_SIZE = 20 * 1024 * 1024;

    if (documentoDetalle && documentoDetalle.size > 0) {
      if (!ALLOWED_DOC_MIME_TYPES.includes(documentoDetalle.type)) {
        return NextResponse.json(
          { message: "Tipo de documento no permitido. Solo se permiten PDF, DOC y DOCX" },
          { status: 400 }
        );
      }
      if (documentoDetalle.size > MAX_DOC_SIZE) {
        return NextResponse.json(
          { message: "El documento excede el tamaño máximo permitido de 20MB" },
          { status: 400 }
        );
      }
    }

    if (fotos.length > 0) {
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

    for (let i = 0; i < vehiculosUsados.length; i++) {
      const vuFotos = formData.getAll(`vehiculosUsadoFotos_${i}`) as File[];
      for (const foto of vuFotos) {
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

    // Procesar fotos del vehículo vendido antes de abrir la transacción
    type ProcessedPhoto = {
      id: string;
      stockId: string;
      nombreArchivo: string;
      mimeType: string;
      datos: Buffer;
      datosThumb: Buffer;
      orden: number;
      creadoEn: Date;
    };

    const fotosVendidoProcesadas: ProcessedPhoto[] = [];
    if (!stockVehicleId && fotos.length > 0) {
      for (const [index, foto] of fotos.entries()) {
        const buffer = Buffer.from(await foto.arrayBuffer());
        try {
          const { full, thumb } = await processVehiclePhoto(buffer);
          fotosVendidoProcesadas.push({
            id: randomUUID(),
            stockId: vehicleId,
            nombreArchivo: foto.name,
            mimeType: "image/webp",
            datos: full,
            datosThumb: thumb,
            orden: index,
            creadoEn: now,
          });
        } catch (error) {
          if (error instanceof ImageTooSmallError) {
            return NextResponse.json(
              { message: `La foto "${foto.name}" no cumple el mínimo de 800px en su lado más largo.` },
              { status: 400 }
            );
          }
          throw error;
        }
      }
    }

    // Procesar fotos de vehículos en intercambio antes de abrir la transacción
    const fotosIntercambioProcesadas: ProcessedPhoto[][] = [];
    for (let i = 0; i < vehiculosUsados.length; i++) {
      const vuFotos = formData.getAll(`vehiculosUsadoFotos_${i}`) as File[];
      const processed: ProcessedPhoto[] = [];
      for (const [index, foto] of vuFotos.entries()) {
        const buffer = Buffer.from(await foto.arrayBuffer());
        try {
          const { full, thumb } = await processVehiclePhoto(buffer);
          processed.push({
            id: randomUUID(),
            stockId: "", // se asigna dentro de la transacción al conocer el id del vehículo
            nombreArchivo: foto.name,
            mimeType: "image/webp",
            datos: full,
            datosThumb: thumb,
            orden: index,
            creadoEn: now,
          });
        } catch (error) {
          if (error instanceof ImageTooSmallError) {
            return NextResponse.json(
              { message: `La foto "${foto.name}" no cumple el mínimo de 800px en su lado más largo.` },
              { status: 400 }
            );
          }
          throw error;
        }
      }
      fotosIntercambioProcesadas.push(processed);
    }

    const newOperation = await prisma.$transaction(async (tx) => {
      let resolvedVehicleId: string;

      if (stockVehicleId) {
        // Use existing stock vehicle — update its estado to en_proceso
        await tx.vehicle.update({
          where: { id: stockVehicleId },
          data: { estado: "en_proceso", actualizadoEn: now },
        });
        resolvedVehicleId = stockVehicleId;
      } else {
        // Create a new vehicle for this operation
        await tx.vehicle.create({
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
        resolvedVehicleId = vehicleId;

        if (fotosVendidoProcesadas.length > 0) {
          await tx.vehiclePhoto.createMany({
            data: fotosVendidoProcesadas,
          });
        }
      }

      const operation = await tx.operation.create({
        data: {
          id: operationId,
          idOperacion: nextIdOperacion,
          clienteId,
          nombreComprador: nombreComprador.trim(),
          fechaInicio: parsedFechaInicio,
          vehiculoVendidoId: resolvedVehicleId,
          precioVentaTotal,
          ingresosBrutos,
          gastosAsociados,
          ingresosNetos,
          comision,
          precioToma: precioToma ?? null,
          estado: "abierta",
          marcaId,
          categoriaId,
          tipoOperacion,
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

      if (documentoDetalle && documentoDetalle.size > 0) {
        const docBuffer = await documentoDetalle.arrayBuffer();
        const docBytes = Buffer.from(docBuffer);
        await tx.operationDocument.create({
          data: {
            id: randomUUID(),
            operacionId: operationId,
            nombreArchivo: documentoDetalle.name,
            mimeType: documentoDetalle.type,
            datos: docBytes,
            actualizadoEn: now,
          },
        });
      }

      for (let i = 0; i < vehiculosUsados.length; i++) {
        const vu = vehiculosUsados[i];
        const usedVehicleId = randomUUID();
        const vuAnio = parseInt(vu.anio, 10);
        const vuKilometros = vu.kilometros ? parseInt(vu.kilometros, 10) : null;
        const vuPrecioRevista = vu.precioRevista ? parseFloat(vu.precioRevista) : null;
        const vuPrecioNegociado = vu.precioNegociado ? parseFloat(vu.precioNegociado) : null;
        const vuPrecioToma = vu.precioToma ? parseFloat(vu.precioToma) : null;

        await tx.vehicle.create({
          data: {
            id: usedVehicleId,
            clienteId,
            operacionId: operationId,
            marcaId: vu.marcaId,
            modelo: vu.modelo,
            anio: vuAnio,
            categoriaId: vu.categoriaId || categoriaId,
            patente: vu.patente || null,
            version: vu.version || null,
            color: vu.color || null,
            kilometros: vuKilometros,
            notasMecanicas: vu.notasMecanicas || null,
            notasGenerales: vu.notasGenerales || null,
            precioRevista: vuPrecioRevista,
            precioToma: vuPrecioToma,
            estado: "intercambio",
            actualizadoEn: now,
          },
        });

        const processedVuFotos = fotosIntercambioProcesadas[i] ?? [];
        if (processedVuFotos.length > 0) {
          await tx.vehiclePhoto.createMany({
            data: processedVuFotos.map((p) => ({ ...p, stockId: usedVehicleId })),
          });
        }

        await tx.operationExchange.create({
          data: {
            id: randomUUID(),
            operacionId: operationId,
            stockId: usedVehicleId,
            precioNegociado: vuPrecioNegociado,
            actualizadoEn: now,
          },
        });

        if (vuPrecioToma && vuPrecioToma > 0) {
          const metodoPagoVehiculo = await tx.paymentMethod.upsert({
            where: { clienteId_nombre: { clienteId, nombre: "Vehiculo tomado" } },
            create: {
              id: randomUUID(),
              clienteId,
              nombre: "Vehiculo tomado",
            },
            update: {},
          });

          await tx.pago.create({
            data: {
              id: randomUUID(),
              operacionId: operationId,
              clienteId,
              fecha: parsedFechaInicio,
              metodoPagoId: metodoPagoVehiculo.id,
              monto: vuPrecioToma,
              nota: `se descuentan $${vuPrecioToma} del vehiculo tomado como forma de pago`,
              actualizadoEn: now,
            },
          });
        }
      }

      // Crear inversión si viene en el payload
      if (inversionStr) {
        try {
          const invData = JSON.parse(inversionStr) as {
            hayInversion: boolean;
            participantes: {
              esConcecionaria: boolean;
              inversorId?: string | null;
              montoAporte: number;
              porcentajeUtilidad?: number | null;
            }[];
          };
          if (
            invData.hayInversion &&
            Array.isArray(invData.participantes) &&
            invData.participantes.length > 0
          ) {
            const montos = invData.participantes.map((p) =>
              typeof p.montoAporte === "number" ? p.montoAporte : 0
            );
            const total = montos.reduce((acc, m) => acc + m, 0);
            const porcentajes =
              total === 0
                ? montos.map(() => 0)
                : montos.map((m) => (m / total) * 100);

            const inversionId = randomUUID();
            await tx.inversion.create({
              data: {
                id: inversionId,
                operacionId: operationId,
                clienteId,
                actualizadoEn: now,
              },
            });

            await tx.inversionParticipante.createMany({
              data: invData.participantes.map((p, idx) => ({
                id: randomUUID(),
                inversionId,
                inversorId: p.esConcecionaria ? null : (p.inversorId ?? null),
                esConcecionaria: p.esConcecionaria,
                montoAporte: montos[idx],
                porcentajeParticipacion: porcentajes[idx],
                porcentajeUtilidad:
                  p.porcentajeUtilidad != null ? p.porcentajeUtilidad : null,
                creadoEn: now,
                actualizadoEn: now,
              })),
            });
          }
        } catch {
          // inversión malformada: se ignora silenciosamente
        }
      }

      return operation;
    });

    return NextResponse.json(
      {
        operation: {
          id: newOperation.id,
          idOperacion: newOperation.idOperacion,
          nombreComprador: newOperation.nombreComprador,
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
          tipoOperacionNombre: newOperation.tipoOperacion,
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
