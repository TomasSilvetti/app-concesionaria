import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

async function loadEntityObj(
  contexto: string,
  contextId: string,
  clienteId: string
): Promise<Record<string, unknown> | null> {
  if (contexto === "operacion") {
    const op = await prisma.operation.findFirst({
      where: { id: contextId, clienteId },
      include: {
        Client: true,
        VehiculoVendido: { include: { VehicleBrand: true, VehicleCategory: true } },
        VehicleBrand: true,
        VehicleCategory: true,
      },
    });
    if (!op) return null;
    return {
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
      cliente: op.Client ? { id: op.Client.id, nombre: op.Client.nombre } : null,
      vehiculo: op.VehiculoVendido
        ? {
            id: op.VehiculoVendido.id,
            modelo: op.VehiculoVendido.modelo,
            version: op.VehiculoVendido.version,
            color: op.VehiculoVendido.color,
            anio: op.VehiculoVendido.anio,
            patente: op.VehiculoVendido.patente,
            kilometros: op.VehiculoVendido.kilometros,
            marca: op.VehiculoVendido.VehicleBrand?.nombre ?? null,
            categoria: op.VehiculoVendido.VehicleCategory?.nombre ?? null,
          }
        : null,
      marca: op.VehicleBrand?.nombre ?? null,
      categoria: op.VehicleCategory?.nombre ?? null,
    };
  } else {
    const vehiculo = await prisma.vehicle.findFirst({
      where: { id: contextId, clienteId },
      include: { VehicleBrand: true, VehicleCategory: true },
    });
    if (!vehiculo) return null;
    return {
      id: vehiculo.id,
      modelo: vehiculo.modelo,
      version: vehiculo.version,
      color: vehiculo.color,
      anio: vehiculo.anio,
      patente: vehiculo.patente,
      kilometros: vehiculo.kilometros,
      marca: vehiculo.VehicleBrand?.nombre ?? null,
      categoria: vehiculo.VehicleCategory?.nombre ?? null,
    };
  }
}

async function generatePdf(
  pdfOriginal: Uint8Array,
  fields: Array<{
    tipo: string;
    nombre: string;
    valorFijo: string | null;
    rutaAuto: string | null;
    posX: number;
    posY: number;
    ancho: number;
    alto: number;
  }>,
  manualFields: Record<string, string>,
  entityObj: Record<string, unknown> | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfOriginal);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const page = pages[0];
  const { height: pageHeight } = page.getSize();

  for (const field of fields) {
    let value: string | null = null;
    if (field.tipo === "fijo") {
      value = field.valorFijo ?? null;
    } else if (field.tipo === "manual") {
      value = manualFields[field.nombre] ?? null;
    } else if (field.tipo === "auto") {
      value = entityObj && field.rutaAuto
        ? resolveAutoPath(entityObj, field.rutaAuto)
        : null;
    }
    if (!value) continue;

    const x = field.posX;
    const y = pageHeight - field.posY - field.alto;
    const fontSize = Math.max(8, Math.min(field.alto * 0.7, 14));

    page.drawText(value, { x, y, size: fontSize, font, color: rgb(0, 0, 0), maxWidth: field.ancho });
  }

  return pdfDoc.save();
}

// PUT /api/documents/[id] — regenera con nuevos manualFields
export async function PUT(
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

    const { id } = await params;

    const doc = await prisma.generatedDocument.findUnique({
      where: { id },
      select: {
        id: true,
        clienteId: true,
        templateId: true,
        contexto: true,
        contextId: true,
        nombreArchivo: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });
    }
    if (doc.clienteId !== clienteId) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const manualFields: Record<string, string> =
      body.manualFields && typeof body.manualFields === "object" ? body.manualFields : {};

    // Cargar template con campos
    const template = await prisma.documentTemplate.findUnique({
      where: { id: doc.templateId },
      include: { DocumentField: { orderBy: { orden: "asc" } } },
    });

    if (!template) {
      return NextResponse.json({ message: "Plantilla no encontrada" }, { status: 404 });
    }

    const entityObj = await loadEntityObj(doc.contexto, doc.contextId, clienteId);

    const pdfBytes = await generatePdf(template.pdfOriginal, template.DocumentField, manualFields, entityObj);
    const pdfGenerado = Buffer.from(pdfBytes);
    const actualizadoEn = new Date();

    const updated = await prisma.generatedDocument.update({
      where: { id },
      data: { pdfGenerado, actualizadoEn },
      select: { id: true, nombreArchivo: true, actualizadoEn: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error al regenerar documento:", error);
    return NextResponse.json(
      { message: "Error al regenerar el documento" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]
export async function DELETE(
  _req: NextRequest,
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

    const { id } = await params;

    const doc = await prisma.generatedDocument.findUnique({
      where: { id },
      select: { id: true, clienteId: true },
    });

    if (!doc) {
      return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });
    }
    if (doc.clienteId !== clienteId) {
      return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    }

    await prisma.generatedDocument.delete({ where: { id } });

    return NextResponse.json({ message: "Documento eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json(
      { message: "Error al eliminar el documento" },
      { status: 500 }
    );
  }
}
