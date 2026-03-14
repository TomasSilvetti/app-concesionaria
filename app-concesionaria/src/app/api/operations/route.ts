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
      modelo: op.modelo,
      anio: op.anio,
      patente: op.patente,
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

    const body = await req.json();
    const {
      fechaInicio,
      modelo,
      anio,
      patente,
      precioVentaTotal,
      ingresosBrutos,
      marcaId,
      categoriaId,
      tipoOperacionId,
      vehiculosIntercambio,
    } = body;

    const errors: string[] = [];

    if (!fechaInicio) errors.push("fechaInicio es requerido");
    if (!modelo) errors.push("modelo es requerido");
    if (anio === undefined || anio === null) errors.push("anio es requerido");
    if (!patente) errors.push("patente es requerido");
    if (precioVentaTotal === undefined || precioVentaTotal === null) errors.push("precioVentaTotal es requerido");
    if (ingresosBrutos === undefined || ingresosBrutos === null) errors.push("ingresosBrutos es requerido");
    if (!marcaId) errors.push("marcaId es requerido");
    if (!categoriaId) errors.push("categoriaId es requerido");
    if (!tipoOperacionId) errors.push("tipoOperacionId es requerido");

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Errores de validación", errors },
        { status: 400 }
      );
    }

    const parsedFechaInicio = new Date(fechaInicio);
    if (isNaN(parsedFechaInicio.getTime())) {
      return NextResponse.json(
        { message: "fechaInicio debe ser una fecha válida" },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (typeof anio !== "number" || anio < 1900 || anio > currentYear + 1) {
      return NextResponse.json(
        { message: `anio debe ser un número entre 1900 y ${currentYear + 1}` },
        { status: 400 }
      );
    }

    if (typeof precioVentaTotal !== "number" || precioVentaTotal <= 0) {
      return NextResponse.json(
        { message: "precioVentaTotal debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (typeof ingresosBrutos !== "number" || ingresosBrutos <= 0) {
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

    if (vehiculosIntercambio && Array.isArray(vehiculosIntercambio)) {
      for (let i = 0; i < vehiculosIntercambio.length; i++) {
        const vehiculo = vehiculosIntercambio[i];
        const vehiculoErrors: string[] = [];

        if (!vehiculo.marcaId) vehiculoErrors.push(`marcaId es requerido`);
        if (!vehiculo.modelo) vehiculoErrors.push(`modelo es requerido`);
        if (vehiculo.anio === undefined || vehiculo.anio === null) vehiculoErrors.push(`anio es requerido`);
        if (!vehiculo.patente) vehiculoErrors.push(`patente es requerido`);
        if (vehiculo.precioNegociado === undefined || vehiculo.precioNegociado === null) vehiculoErrors.push(`precioNegociado es requerido`);

        if (vehiculoErrors.length > 0) {
          return NextResponse.json(
            { 
              message: `Errores de validación en vehículo de intercambio ${i + 1}`, 
              errors: vehiculoErrors 
            },
            { status: 400 }
          );
        }

        if (typeof vehiculo.anio !== "number" || vehiculo.anio < 1900 || vehiculo.anio > currentYear + 1) {
          return NextResponse.json(
            { message: `anio del vehículo de intercambio ${i + 1} debe ser un número entre 1900 y ${currentYear + 1}` },
            { status: 400 }
          );
        }

        if (typeof vehiculo.precioNegociado !== "number" || vehiculo.precioNegociado < 0) {
          return NextResponse.json(
            { message: `precioNegociado del vehículo de intercambio ${i + 1} debe ser un número positivo o cero` },
            { status: 400 }
          );
        }

        const marcaVehiculo = await prisma.vehicleBrand.findFirst({
          where: { id: vehiculo.marcaId, clienteId },
        });

        if (!marcaVehiculo) {
          return NextResponse.json(
            { message: `marcaId del vehículo de intercambio ${i + 1} no existe o no pertenece al cliente` },
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

    if (vehiculosIntercambio && Array.isArray(vehiculosIntercambio) && vehiculosIntercambio.length > 0) {
      const result = await prisma.$transaction(async (tx) => {
        const newOperation = await tx.operation.create({
          data: {
            id: randomUUID(),
            idOperacion: nextIdOperacion,
            clienteId,
            fechaInicio: parsedFechaInicio,
            modelo,
            anio,
            patente,
            precioVentaTotal,
            ingresosBrutos,
            gastosAsociados,
            ingresosNetos,
            comision,
            estado: "abierta",
            marcaId,
            categoriaId,
            tipoOperacionId,
            actualizadoEn: new Date(),
          },
        });

        let vehiculoCounter = 1;
        for (const vehiculo of vehiculosIntercambio) {
          const vehiculoIdOperacion = `${nextIdOperacion}-INT-${vehiculoCounter.toString().padStart(2, '0')}`;
          
          const vehiculoOperation = await tx.operation.create({
            data: {
              id: randomUUID(),
              idOperacion: vehiculoIdOperacion,
              clienteId,
              fechaInicio: parsedFechaInicio,
              modelo: vehiculo.modelo,
              anio: vehiculo.anio,
              patente: vehiculo.patente,
              precioVentaTotal: vehiculo.precioNegociado,
              ingresosBrutos: 0,
              gastosAsociados: 0,
              ingresosNetos: 0,
              comision: 0,
              estado: "abierta",
              marcaId: vehiculo.marcaId,
              categoriaId,
              tipoOperacionId,
              actualizadoEn: new Date(),
            },
          });
          
          const vehiculoStock = await tx.stock.create({
            data: {
              id: randomUUID(),
              operacionId: vehiculoOperation.id,
              clienteId,
              tipoIngreso: "intercambio",
              version: vehiculo.version || null,
              color: vehiculo.color || null,
              kilometros: vehiculo.kilometros || null,
              notasMecanicas: vehiculo.notasMecanicas || null,
              notasGenerales: vehiculo.notasGenerales || null,
              precioOferta: vehiculo.precioNegociado,
              precioRevista: null,
              actualizadoEn: new Date(),
            },
          });

          await tx.operationExchange.create({
            data: {
              id: randomUUID(),
              operacionId: newOperation.id,
              stockId: vehiculoStock.id,
              precioNegociado: vehiculo.precioNegociado,
              actualizadoEn: new Date(),
            },
          });

          vehiculoCounter++;
        }

        return await tx.operation.findUnique({
          where: { id: newOperation.id },
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
            OperationExchange: {
              include: {
                Stock: {
                  include: {
                    Operation: {
                      include: {
                        VehicleBrand: {
                          select: {
                            nombre: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      });

      return NextResponse.json(
        {
          operation: {
            id: result!.id,
            idOperacion: result!.idOperacion,
            fechaInicio: result!.fechaInicio,
            modelo: result!.modelo,
            anio: result!.anio,
            patente: result!.patente,
            precioVentaTotal: result!.precioVentaTotal,
            ingresosBrutos: result!.ingresosBrutos,
            gastosAsociados: result!.gastosAsociados,
            ingresosNetos: result!.ingresosNetos,
            comision: result!.comision,
            estado: result!.estado,
            marcaNombre: result!.VehicleBrand.nombre,
            categoriaNombre: result!.VehicleCategory.nombre,
            tipoOperacionNombre: result!.OperationType.nombre,
            vehiculosIntercambiados: result!.OperationExchange.map(exchange => ({
              id: exchange.id,
              stockId: exchange.stockId,
              precioNegociado: exchange.precioNegociado,
              stock: exchange.Stock,
            })),
          },
        },
        { status: 201 }
      );
    }

    const newOperation = await prisma.operation.create({
      data: {
        id: randomUUID(),
        idOperacion: nextIdOperacion,
        clienteId,
        fechaInicio: parsedFechaInicio,
        modelo,
        anio,
        patente,
        precioVentaTotal,
        ingresosBrutos,
        gastosAsociados,
        ingresosNetos,
        comision,
        estado: "abierta",
        marcaId,
        categoriaId,
        tipoOperacionId,
        actualizadoEn: new Date(),
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
      },
    });

    return NextResponse.json(
      {
        operation: {
          id: newOperation.id,
          idOperacion: newOperation.idOperacion,
          fechaInicio: newOperation.fechaInicio,
          modelo: newOperation.modelo,
          anio: newOperation.anio,
          patente: newOperation.patente,
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
