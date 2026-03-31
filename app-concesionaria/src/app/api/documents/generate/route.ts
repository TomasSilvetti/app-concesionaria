import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { randomUUID } from "crypto";

const VALID_CONTEXT_TYPES = ["operacion", "vehiculo"] as const;
type ContextType = (typeof VALID_CONTEXT_TYPES)[number];

// Resuelve una ruta punteada ("cliente.nombre") sobre un objeto.
// Devuelve string o null sin lanzar error si el camino no existe.
function resolveAutoPath(obj: Record<string, unknown>, path: string): string | null {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return null;
    }
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
        include: {
          VehicleBrand: true,
          VehicleCategory: true,
        },
      },
      VehicleBrand: true,
      VehicleCategory: true,
    },
  });
}

async function loadVehiculoContext(contextId: string, clienteId: string) {
  return prisma.vehicle.findFirst({
    where: { id: contextId, clienteId },
    include: {
      VehicleBrand: true,
      VehicleCategory: true,
    },
  });
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { templateId, contextType, contextId, manualFields } = body;

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ message: "templateId es requerido" }, { status: 400 });
    }
    if (!contextType || !VALID_CONTEXT_TYPES.includes(contextType as ContextType)) {
      return NextResponse.json(
        { message: "contextType inválido. Debe ser 'operacion' o 'vehiculo'" },
        { status: 400 }
      );
    }
    if (!contextId || typeof contextId !== "string") {
      return NextResponse.json({ message: "contextId es requerido" }, { status: 400 });
    }

    // Verificar que la plantilla existe y está asignada y activa para esta empresa
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
        { message: "Plantilla no encontrada o no disponible para esta empresa" },
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

    // Cargar y modificar el PDF
    const pdfBytes = template.pdfOriginal;
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const page = pages[0]; // Se trabaja sobre la primera página
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const safeManualFields: Record<string, string> =
      manualFields && typeof manualFields === "object" ? manualFields : {};

    for (const field of template.DocumentField) {
      let value: string | null = null;

      if (field.tipo === "fijo") {
        value = field.valorFijo ?? null;
      } else if (field.tipo === "manual") {
        value = safeManualFields[field.id] ?? null;
      } else if (field.tipo === "auto") {
        value = entityObj && field.rutaAuto
          ? resolveAutoPath(entityObj, field.rutaAuto)
          : null;
      }

      if (!value) continue;

      // posX/posY/ancho/alto se guardan como porcentajes (0-100) relativos al PDF.
      // pdf-lib: origen en esquina inferior izquierda; convertimos posY desde esquina superior.
      const x = (field.posX / 100) * pageWidth;
      const fieldHeightPts = (field.alto / 100) * pageHeight;
      const y = pageHeight - (field.posY / 100) * pageHeight - fieldHeightPts;
      const fontSize = Math.max(6, Math.min(fieldHeightPts * 0.75, 14));

      page.drawText(value, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: (field.ancho / 100) * pageWidth,
      });
    }

    const pdfGenerado = Buffer.from(await pdfDoc.save());

    // Nombre del archivo
    const fechaStr = new Date().toISOString().split("T")[0];
    const nombrePlantilla = template.nombre
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const nombreArchivo = `${nombrePlantilla}-${fechaStr}-${contextId}.pdf`;

    const now = new Date();

    const generated = await prisma.generatedDocument.create({
      data: {
        id: randomUUID(),
        templateId: template.id,
        clienteId,
        contexto: contextType as ContextType,
        contextId,
        pdfGenerado,
        nombreArchivo,
        mimeType: "application/pdf",
        creadoEn: now,
        actualizadoEn: now,
      },
    });

    return NextResponse.json(
      {
        id: generated.id,
        nombreArchivo: generated.nombreArchivo,
        creadoEn: generated.creadoEn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al generar documento:", error);
    return NextResponse.json(
      { message: "Error al generar el documento" },
      { status: 500 }
    );
  }
}
