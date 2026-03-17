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

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de operación requerido" },
        { status: 400 }
      );
    }

    const operation = await prisma.operation.findFirst({
      where: {
        idOperacion: id,
        clienteId: clienteId,
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
        OperationExchange: {
          include: {
            Vehicle: {
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
        Expense: {
          include: {
            Category: {
              select: {
                nombre: true,
              },
            },
          },
        },
        OperationDocument: {
          select: {
            id: true,
            nombreArchivo: true,
          },
        },
      },
    });

    if (!operation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    const fechaFin = operation.fechaVenta ? new Date(operation.fechaVenta) : new Date();
    const fechaInicio = new Date(operation.fechaInicio);
    const diasVenta = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

    const operationFormatted = {
      idOperacion: operation.idOperacion,
      fechaInicio: operation.fechaInicio,
      fechaVenta: operation.fechaVenta,
      diasVenta: diasVenta,
      modelo: operation.VehiculoVendido.modelo,
      anio: operation.VehiculoVendido.anio,
      patente: operation.VehiculoVendido.patente,
      version: operation.VehiculoVendido.version,
      color: operation.VehiculoVendido.color,
      kilometros: operation.VehiculoVendido.kilometros,
      notasMecanicas: operation.VehiculoVendido.notasMecanicas,
      notasGenerales: operation.VehiculoVendido.notasGenerales,
      precioRevista: operation.VehiculoVendido.precioRevista,
      precioOferta: operation.VehiculoVendido.precioOferta,
      fotos: operation.VehiculoVendido.VehiclePhoto.map((photo) => ({
        id: photo.id,
        nombreArchivo: photo.nombreArchivo,
        orden: photo.orden,
      })),
      precioVentaTotal: operation.precioVentaTotal,
      ingresosBrutos: operation.ingresosBrutos,
      gastosAsociados: operation.gastosAsociados,
      ingresosNetos: operation.ingresosNetos,
      comision: operation.comision,
      precioToma: operation.precioToma,
      estado: operation.estado,
      marcaNombre: operation.VehicleBrand.nombre,
      categoriaNombre: operation.VehicleCategory.nombre,
      tipoOperacionNombre: operation.OperationType.nombre,
      marcaId: operation.marcaId,
      categoriaId: operation.categoriaId,
      tipoOperacionId: operation.tipoOperacionId,
      documentoDetalle: operation.OperationDocument
        ? { id: operation.OperationDocument.id, nombreArchivo: operation.OperationDocument.nombreArchivo }
        : null,
      vehiculosIntercambiados: operation.OperationExchange.map((exchange) => ({
        marca: exchange.Vehicle.VehicleBrand.nombre,
        modelo: exchange.Vehicle.modelo,
        anio: exchange.Vehicle.anio,
        patente: exchange.Vehicle.patente,
        precioNegociado: exchange.precioNegociado,
        version: exchange.Vehicle.version,
        color: exchange.Vehicle.color,
        kilometros: exchange.Vehicle.kilometros,
      })),
      gastos: operation.Expense.map((expense) => ({
        fecha: expense.fecha,
        descripcion: expense.descripcion,
        categoria: expense.Category.nombre,
        monto: expense.monto,
      })),
    };

    return NextResponse.json(operationFormatted, { status: 200 });
  } catch (error) {
    console.error("Error al obtener operación:", error);
    return NextResponse.json(
      { message: "Error al obtener operación" },
      { status: 500 }
    );
  }
}

const ALLOWED_ESTADOS = ["abierta", "cerrada", "cancelada", "open"] as const;

export async function PATCH(
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

    const clienteId = session.user.clienteId;

    if (!clienteId) {
      return NextResponse.json(
        { message: "Usuario sin cliente asociado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de operación requerido" },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Cuerpo JSON inválido" },
        { status: 400 }
      );
    }

    if (id.includes("-INT-")) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    const existingOperation = await prisma.operation.findFirst({
      where: {
        idOperacion: id,
        clienteId: clienteId,
      },
    });

    if (!existingOperation) {
      return NextResponse.json(
        { message: "Operación no encontrada" },
        { status: 404 }
      );
    }

    const errors: string[] = [];
    const updateData: Record<string, unknown> = {};

    const editableFields = [
      "fechaInicio",
      "fechaVenta",
      "precioVentaTotal",
      "ingresosBrutos",
      "precioToma",
      "estado",
      "tipoOperacionId",
    ] as const;

    for (const field of editableFields) {
      if (!(field in body)) continue;

      const value = body[field];

      switch (field) {
        case "fechaInicio": {
          if (value === null || value === undefined || value === "") continue;
          const parsed = new Date(value as string);
          if (isNaN(parsed.getTime())) {
            errors.push("fechaInicio debe ser una fecha válida");
          } else {
            updateData.fechaInicio = parsed;
          }
          break;
        }
        case "fechaVenta": {
          if (value === null || value === "") {
            updateData.fechaVenta = null;
          } else {
            const parsed = new Date(value as string);
            if (isNaN(parsed.getTime())) {
              errors.push("fechaVenta debe ser una fecha válida");
            } else {
              updateData.fechaVenta = parsed;
            }
          }
          break;
        }
        case "precioVentaTotal": {
          const num = typeof value === "string" ? parseFloat(value) : value;
          if (typeof num !== "number" || isNaN(num) || num <= 0) {
            errors.push("precioVentaTotal debe ser un número positivo");
          } else {
            updateData.precioVentaTotal = num;
          }
          break;
        }
        case "ingresosBrutos": {
          const num = typeof value === "string" ? parseFloat(value) : value;
          if (typeof num !== "number" || isNaN(num) || num <= 0) {
            errors.push("ingresosBrutos debe ser un número positivo");
          } else {
            updateData.ingresosBrutos = num;
          }
          break;
        }
        case "precioToma": {
          if (value === null || value === "") {
            updateData.precioToma = null;
          } else {
            const num = typeof value === "string" ? parseFloat(value) : value;
            if (typeof num !== "number" || isNaN(num) || num <= 0) {
              errors.push("precioToma debe ser un número positivo");
            } else {
              updateData.precioToma = num;
            }
          }
          break;
        }
        case "estado":
          if (typeof value === "string" && ALLOWED_ESTADOS.includes(value as (typeof ALLOWED_ESTADOS)[number])) {
            updateData.estado = value;
          } else if (value !== undefined && value !== null) {
            errors.push(`estado debe ser uno de: ${ALLOWED_ESTADOS.join(", ")}`);
          }
          break;
        case "tipoOperacionId":
          if (typeof value === "string" && value.trim()) {
            updateData[field] = value.trim();
          } else if (value !== undefined && value !== null) {
            errors.push(`${field} debe ser un ID válido`);
          }
          break;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Errores de validación", errors },
        { status: 400 }
      );
    }

    const fechaInicio = (updateData.fechaInicio as Date) ?? existingOperation.fechaInicio;
    const fechaVenta = updateData.fechaVenta !== undefined
      ? (updateData.fechaVenta as Date | null)
      : existingOperation.fechaVenta;

    if (fechaVenta && new Date(fechaVenta) < new Date(fechaInicio)) {
      return NextResponse.json(
        { message: "fechaVenta no puede ser anterior a fechaInicio" },
        { status: 400 }
      );
    }

    if (updateData.tipoOperacionId) {
      const tipoOp = await prisma.operationType.findFirst({
        where: { id: updateData.tipoOperacionId as string, clienteId },
      });
      if (!tipoOp) {
        return NextResponse.json(
          { message: "tipoOperacionId no existe o no pertenece al cliente" },
          { status: 400 }
        );
      }
    }

    const gastosAsociados = existingOperation.gastosAsociados;
    const ingresosBrutos = (updateData.ingresosBrutos as number) ?? existingOperation.ingresosBrutos;
    const precioVentaTotal = (updateData.precioVentaTotal as number) ?? existingOperation.precioVentaTotal;

    const ingresosNetos = ingresosBrutos - gastosAsociados;
    const comision = precioVentaTotal > 0
      ? (ingresosNetos / precioVentaTotal) * 100
      : 0;

    const dataToUpdate: Record<string, unknown> = {
      ...updateData,
      ingresosNetos,
      comision,
      actualizadoEn: new Date(),
    };

    const updated = await prisma.operation.update({
      where: { id: existingOperation.id },
      data: dataToUpdate,
      include: {
        VehicleBrand: { select: { nombre: true } },
        VehicleCategory: { select: { nombre: true } },
        OperationType: { select: { nombre: true } },
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
        OperationExchange: {
          include: {
            Vehicle: {
              include: {
                VehicleBrand: { select: { nombre: true } },
              },
            },
          },
        },
        Expense: {
          include: {
            Category: { select: { nombre: true } },
          },
        },
      },
    });

    const fechaFin = updated.fechaVenta ? new Date(updated.fechaVenta) : new Date();
    const diasVenta = Math.floor(
      (fechaFin.getTime() - new Date(updated.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
    );

    const updatedWithVehicle = await prisma.operation.findUnique({
      where: { id: updated.id },
      include: {
        VehicleBrand: { select: { nombre: true } },
        VehicleCategory: { select: { nombre: true } },
        OperationType: { select: { nombre: true } },
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
        OperationExchange: {
          include: {
            Vehicle: {
              include: {
                VehicleBrand: { select: { nombre: true } },
              },
            },
          },
        },
        Expense: {
          include: {
            Category: { select: { nombre: true } },
          },
        },
        OperationDocument: {
          select: {
            id: true,
            nombreArchivo: true,
          },
        },
      },
    });

    if (!updatedWithVehicle) {
      return NextResponse.json(
        { message: "Error al obtener operación actualizada" },
        { status: 500 }
      );
    }

    const operationFormatted = {
      idOperacion: updatedWithVehicle.idOperacion,
      fechaInicio: updatedWithVehicle.fechaInicio,
      fechaVenta: updatedWithVehicle.fechaVenta,
      diasVenta,
      modelo: updatedWithVehicle.VehiculoVendido.modelo,
      anio: updatedWithVehicle.VehiculoVendido.anio,
      patente: updatedWithVehicle.VehiculoVendido.patente,
      version: updatedWithVehicle.VehiculoVendido.version,
      color: updatedWithVehicle.VehiculoVendido.color,
      kilometros: updatedWithVehicle.VehiculoVendido.kilometros,
      notasMecanicas: updatedWithVehicle.VehiculoVendido.notasMecanicas,
      notasGenerales: updatedWithVehicle.VehiculoVendido.notasGenerales,
      precioRevista: updatedWithVehicle.VehiculoVendido.precioRevista,
      precioOferta: updatedWithVehicle.VehiculoVendido.precioOferta,
      fotos: updatedWithVehicle.VehiculoVendido.VehiclePhoto.map((photo) => ({
        id: photo.id,
        nombreArchivo: photo.nombreArchivo,
        orden: photo.orden,
      })),
      precioVentaTotal: updatedWithVehicle.precioVentaTotal,
      ingresosBrutos: updatedWithVehicle.ingresosBrutos,
      gastosAsociados: updatedWithVehicle.gastosAsociados,
      ingresosNetos: updatedWithVehicle.ingresosNetos,
      comision: updatedWithVehicle.comision,
      precioToma: updatedWithVehicle.precioToma,
      estado: updatedWithVehicle.estado,
      marcaNombre: updatedWithVehicle.VehicleBrand.nombre,
      categoriaNombre: updatedWithVehicle.VehicleCategory.nombre,
      tipoOperacionNombre: updatedWithVehicle.OperationType.nombre,
      marcaId: updatedWithVehicle.marcaId,
      categoriaId: updatedWithVehicle.categoriaId,
      tipoOperacionId: updatedWithVehicle.tipoOperacionId,
      documentoDetalle: updatedWithVehicle.OperationDocument
        ? { id: updatedWithVehicle.OperationDocument.id, nombreArchivo: updatedWithVehicle.OperationDocument.nombreArchivo }
        : null,
      vehiculosIntercambiados: updatedWithVehicle.OperationExchange.map((ex) => ({
        marca: ex.Vehicle.VehicleBrand.nombre,
        modelo: ex.Vehicle.modelo,
        anio: ex.Vehicle.anio,
        patente: ex.Vehicle.patente,
        precioNegociado: ex.precioNegociado,
        version: ex.Vehicle.version,
        color: ex.Vehicle.color,
        kilometros: ex.Vehicle.kilometros,
      })),
      gastos: updatedWithVehicle.Expense.map((exp) => ({
        fecha: exp.fecha,
        descripcion: exp.descripcion,
        categoria: exp.Category.nombre,
        monto: exp.monto,
      })),
    };

    return NextResponse.json(operationFormatted, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar operación:", error);
    return NextResponse.json(
      { message: "Error al actualizar operación" },
      { status: 500 }
    );
  }
}
