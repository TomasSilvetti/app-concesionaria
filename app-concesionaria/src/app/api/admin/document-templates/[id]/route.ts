import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Esquema centralizado de rutas Auto por contexto ─────────────────────────

const AUTO_ROUTES: Record<string, Set<string>> = {
  operacion: new Set([
    "operacion.idOperacion",
    "operacion.fechaInicio",
    "operacion.fechaVenta",
    "operacion.precioVentaTotal",
    "operacion.ingresosBrutos",
    "operacion.comision",
    "operacion.gastosAsociados",
    "operacion.ingresosNetos",
    "operacion.estado",
    "operacion.tipoOperacion",
    "operacion.nombreComprador",
    "operacion.precioToma",
    "operacion.vehiculo.modelo",
    "operacion.vehiculo.patente",
    "operacion.vehiculo.anio",
    "operacion.vehiculo.color",
    "operacion.vehiculo.kilometros",
    "operacion.vehiculo.version",
    "operacion.marca.nombre",
    "operacion.categoria.nombre",
  ]),
  vehiculo: new Set([
    "vehiculo.modelo",
    "vehiculo.patente",
    "vehiculo.anio",
    "vehiculo.color",
    "vehiculo.kilometros",
    "vehiculo.version",
    "vehiculo.precioRevista",
    "vehiculo.precioOferta",
    "vehiculo.precioToma",
    "vehiculo.estado",
    "vehiculo.notasGenerales",
    "vehiculo.notasMecanicas",
    "vehiculo.marca.nombre",
    "vehiculo.categoria.nombre",
  ]),
};

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden ver plantillas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        contexto: true,
        mimeType: true,
        creadoEn: true,
        actualizadoEn: true,
        clienteId: true,
        DocumentField: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            valorFijo: true,
            rutaAuto: true,
            posX: true,
            posY: true,
            ancho: true,
            alto: true,
            orden: true,
          },
          orderBy: { orden: "asc" },
        },
        DocumentAssignment: {
          select: {
            id: true,
            clienteId: true,
            activo: true,
            creadoEn: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener plantilla:", error);
    return NextResponse.json(
      { message: "Error al obtener plantilla" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden editar plantillas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.documentTemplate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Plantilla no encontrada" }, { status: 404 });
    }

    const formData = await req.formData();

    const pdfFile = formData.get("pdf");
    const nombre = formData.get("nombre");
    const contexto = formData.get("contexto");
    const camposRaw = formData.get("campos");

    if (
      !nombre || typeof nombre !== "string" || nombre.trim() === "" ||
      !contexto || typeof contexto !== "string" ||
      !camposRaw || typeof camposRaw !== "string"
    ) {
      return NextResponse.json(
        { message: "Faltan campos requeridos: nombre, contexto, campos" },
        { status: 400 }
      );
    }

    if (contexto !== "operacion" && contexto !== "vehiculo") {
      return NextResponse.json(
        { message: "El contexto debe ser 'operacion' o 'vehiculo'" },
        { status: 400 }
      );
    }

    let campos: Array<{
      nombre: string;
      tipo: string;
      valorFijo?: string;
      rutaAuto?: string;
      posX: number;
      posY: number;
      ancho: number;
      alto: number;
      orden: number;
    }>;

    try {
      campos = JSON.parse(camposRaw);
    } catch {
      return NextResponse.json(
        { message: "El campo 'campos' no es un JSON válido" },
        { status: 400 }
      );
    }

    if (!Array.isArray(campos)) {
      return NextResponse.json(
        { message: "El campo 'campos' debe ser un array" },
        { status: 400 }
      );
    }

    const validTypes = new Set(["auto", "fijo", "manual", "manual_opcional"]);
    const rutasValidas = AUTO_ROUTES[contexto];

    for (let i = 0; i < campos.length; i++) {
      const campo = campos[i];
      const idx = `campos[${i}]`;

      if (!campo.nombre || typeof campo.nombre !== "string" || campo.nombre.trim() === "") {
        return NextResponse.json({ message: `${idx}: 'nombre' es requerido` }, { status: 400 });
      }

      if (!validTypes.has(campo.tipo)) {
        return NextResponse.json(
          { message: `${idx}: 'tipo' debe ser 'auto', 'fijo' o 'manual'` },
          { status: 400 }
        );
      }

      if (campo.tipo === "auto") {
        if (!campo.rutaAuto || typeof campo.rutaAuto !== "string" || campo.rutaAuto.trim() === "") {
          return NextResponse.json(
            { message: `${idx}: los campos de tipo 'auto' requieren 'rutaAuto'` },
            { status: 400 }
          );
        }
        if (!rutasValidas.has(campo.rutaAuto)) {
          return NextResponse.json(
            { message: `${idx}: la ruta '${campo.rutaAuto}' no es válida para el contexto '${contexto}'` },
            { status: 400 }
          );
        }
      }

      if (campo.tipo === "fijo") {
        if (!campo.valorFijo || typeof campo.valorFijo !== "string" || campo.valorFijo.trim() === "") {
          return NextResponse.json(
            { message: `${idx}: los campos de tipo 'fijo' requieren 'valorFijo' no vacío` },
            { status: 400 }
          );
        }
      }

      if (
        typeof campo.posX !== "number" ||
        typeof campo.posY !== "number" ||
        typeof campo.ancho !== "number" ||
        typeof campo.alto !== "number" ||
        typeof campo.orden !== "number"
      ) {
        return NextResponse.json(
          { message: `${idx}: posX, posY, ancho, alto y orden deben ser números` },
          { status: 400 }
        );
      }
    }

    const pdfUpdate =
      pdfFile && typeof pdfFile !== "string"
        ? {
            pdfOriginal: Buffer.from(await pdfFile.arrayBuffer()),
            mimeType: pdfFile.type || "application/pdf",
          }
        : {};

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.documentTemplate.update({
        where: { id },
        data: {
          nombre: nombre.trim(),
          contexto: contexto as "operacion" | "vehiculo",
          actualizadoEn: now,
          ...pdfUpdate,
        },
      });

      await tx.documentField.deleteMany({ where: { templateId: id } });

      if (campos.length > 0) {
        await tx.documentField.createMany({
          data: campos.map((campo, i) => ({
            id: randomUUID(),
            templateId: id,
            nombre: campo.nombre.trim(),
            tipo: campo.tipo as "auto" | "fijo" | "manual" | "manual_opcional",
            valorFijo: campo.tipo === "fijo" ? campo.valorFijo ?? null : null,
            rutaAuto: campo.tipo === "auto" ? campo.rutaAuto ?? null : null,
            posX: campo.posX,
            posY: campo.posY,
            ancho: campo.ancho,
            alto: campo.alto,
            orden: i,
          })),
        });
      }
    });

    return NextResponse.json({ id, nombre: nombre.trim() }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar plantilla:", error);
    return NextResponse.json({ message: "Error al actualizar plantilla" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    if (session.user.rol !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado. Solo administradores pueden eliminar plantillas." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.documentTemplate.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Plantilla no encontrada" },
        { status: 404 }
      );
    }

    await prisma.documentTemplate.delete({ where: { id } });

    return NextResponse.json(
      { message: "Plantilla eliminada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar plantilla:", error);
    return NextResponse.json(
      { message: "Error al eliminar plantilla" },
      { status: 500 }
    );
  }
}
