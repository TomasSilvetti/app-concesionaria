import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_CONTEXT_TYPES = ["operacion", "vehiculo"] as const;
type ContextType = (typeof VALID_CONTEXT_TYPES)[number];

function resolveAutoPath(obj: Record<string, unknown>, path: string): string | null {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[part];
  }
  if (current === null || current === undefined) return null;
  return String(current);
}

async function loadOperacionContext(contextId: string, clienteId: string) {
  return prisma.operation.findFirst({
    where: { idOperacion: contextId, clienteId },
    include: {
      Client: true,
      VehiculoVendido: {
        include: { VehicleBrand: true, VehicleCategory: true },
      },
      VehicleBrand: true,
      VehicleCategory: true,
    },
  });
}

async function loadVehiculoContext(contextId: string, clienteId: string) {
  return prisma.vehicle.findFirst({
    where: { id: contextId, clienteId },
    include: { VehicleBrand: true, VehicleCategory: true },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const clienteId = session.user.clienteId;
    if (!clienteId) {
      return NextResponse.json(
        { message: "El usuario no tiene empresa asociada" },
        { status: 403 }
      );
    }

    const { id: templateId } = await params;
    const { searchParams } = new URL(req.url);
    const contextType = searchParams.get("contextType");
    const contextId = searchParams.get("contextId");

    if (!contextType || !VALID_CONTEXT_TYPES.includes(contextType as ContextType)) {
      return NextResponse.json(
        { message: "contextType inválido. Debe ser 'operacion' o 'vehiculo'" },
        { status: 400 }
      );
    }
    if (!contextId) {
      return NextResponse.json(
        { message: "El parámetro contextId es requerido" },
        { status: 400 }
      );
    }

    const assignment = await prisma.documentAssignment.findFirst({
      where: { templateId, clienteId, activo: true },
      include: {
        DocumentTemplate: {
          include: { DocumentField: { orderBy: { orden: "asc" } } },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Plantilla no disponible para esta empresa" },
        { status: 403 }
      );
    }

    const template = assignment.DocumentTemplate;

    // Cargar entidad de contexto
    let entityObj: Record<string, unknown> | null = null;
    if (contextType === "operacion") {
      const op = await loadOperacionContext(contextId, clienteId);
      if (op) {
        entityObj = {
          operacion: {
            id: op.id,
            idOperacion: op.idOperacion,
            fechaInicio: op.fechaInicio?.toISOString().split("T")[0] ?? null,
            fechaVenta: op.fechaVenta?.toISOString().split("T")[0] ?? null,
            precioVentaTotal: op.precioVentaTotal,
            ingresosBrutos: op.ingresosBrutos,
            comision: op.comision,
            gastosAsociados: op.gastosAsociados,
            ingresosNetos: op.ingresosNetos,
            estado: op.estado,
            tipoOperacion: op.tipoOperacion,
            nombreComprador: op.nombreComprador,
            precioToma: op.precioToma,
            vehiculo: op.VehiculoVendido
              ? {
                  id: op.VehiculoVendido.id,
                  modelo: op.VehiculoVendido.modelo,
                  version: op.VehiculoVendido.version,
                  color: op.VehiculoVendido.color,
                  anio: op.VehiculoVendido.anio,
                  patente: op.VehiculoVendido.patente,
                  kilometros: op.VehiculoVendido.kilometros,
                }
              : null,
            marca: op.VehicleBrand ? { nombre: op.VehicleBrand.nombre } : null,
            categoria: op.VehicleCategory ? { nombre: op.VehicleCategory.nombre } : null,
          },
        } as Record<string, unknown>;
      }
    } else {
      const vehiculo = await loadVehiculoContext(contextId, clienteId);
      if (vehiculo) {
        entityObj = {
          vehiculo: {
            id: vehiculo.id,
            modelo: vehiculo.modelo,
            version: vehiculo.version,
            color: vehiculo.color,
            anio: vehiculo.anio,
            patente: vehiculo.patente,
            kilometros: vehiculo.kilometros,
            marca: vehiculo.VehicleBrand ? { nombre: vehiculo.VehicleBrand.nombre } : null,
            categoria: vehiculo.VehicleCategory ? { nombre: vehiculo.VehicleCategory.nombre } : null,
          },
        } as Record<string, unknown>;
      }
    }

    const fields = template.DocumentField.map((field) => {
      let value: string | null = null;
      if (field.tipo === "fijo") {
        value = field.valorFijo ?? null;
      } else if (field.tipo === "auto") {
        value =
          entityObj && field.rutaAuto
            ? resolveAutoPath(entityObj, field.rutaAuto)
            : null;
      }
      // tipo "manual": value queda null, el usuario lo completa

      const tipoMap = { auto: "Auto", fijo: "Fijo", manual: "Manual" } as const;

      return {
        id: field.id,
        label: field.nombre,
        tipo: tipoMap[field.tipo],
        value,
        x: field.posX,
        y: field.posY,
        width: field.ancho,
        height: field.alto,
      };
    });

    return NextResponse.json(
      {
        templateName: template.nombre,
        fields,
        pdfBase64: Buffer.from(template.pdfOriginal).toString("base64"),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cargar vista previa del documento:", error);
    return NextResponse.json(
      { message: "Error al cargar la vista previa" },
      { status: 500 }
    );
  }
}
