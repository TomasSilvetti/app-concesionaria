# porcion-003 — Procesamiento de fotos en endpoints de subida [BACK]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-26

## Descripción

Modificar los endpoints de subida de fotos para que utilicen el servicio `processVehiclePhoto` de `src/lib/imageProcessor.ts`. Cada foto recibida pasa por el procesador: se generan ambas versiones (full + thumb) y se guardan en los campos `datos` y `datosThumb` con `mimeType = "image/webp"`.

La validación de dimensiones mínimas ocurre en el frontend (porcion-007) antes de enviar el formulario, por lo que en condiciones normales todas las fotos que llegan al backend son válidas. Si aun así `processVehiclePhoto` lanza `ImageTooSmallError` (acceso directo a la API, bypass del front), el endpoint responde con **400** indicando qué archivo no cumple el requisito. Un error inesperado de Sharp (que no sea `ImageTooSmallError`) propaga un **500**.

Los endpoints afectados son:
- `src/app/api/stock/route.ts` (POST — creación de vehículo con fotos)
- `src/app/api/stock/[id]/route.ts` (PUT — edición de vehículo con fotos)
- `src/app/api/operations/route.ts` (POST — fotos del vehículo vendido y de vehículos en intercambio)
- `src/app/api/operations/[id]/route.ts` (PATCH — no aplica, solo acepta JSON)

**Archivos a modificar:**
- `src/app/api/stock/route.ts`
- `src/app/api/stock/[id]/route.ts`
- `src/app/api/operations/route.ts`

## Ejemplo de uso

```typescript
// Dentro del handler POST de /api/stock
const fotos = formData.getAll("fotos") as File[];

// Procesar fotos ANTES de abrir transacciones
const photosData: PhotoData[] = [];
for (const [index, foto] of fotos.entries()) {
  const buffer = Buffer.from(await foto.arrayBuffer());
  try {
    const { full, thumb } = await processVehiclePhoto(buffer);
    photosData.push({
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

// En la respuesta (sin fotosRechazadas):
return NextResponse.json({ vehicle: ..., message: "Vehículo creado exitosamente" }, { status: 201 });
```

> **Nota para operations/route.ts:** El procesamiento de fotos debe realizarse **antes** de abrir la transacción Prisma (`$transaction`) para no mantener transacciones abiertas mientras corre Sharp.

## Criterios de aceptación

- [ ] Al subir una foto válida (≥ 800px), se guardan `datos` (versión full WebP) y `datosThumb` (versión thumb WebP) con `mimeType = "image/webp"`.
- [ ] Si una foto llega al backend con < 800px (bypass del front), el endpoint responde **400** con un mensaje que identifica el archivo.
- [ ] Un error inesperado en Sharp (no `ImageTooSmallError`) propaga un **500** al cliente.
- [ ] Los endpoints de stock POST y PUT aplican el procesamiento.
- [ ] El endpoint POST de operations aplica el procesamiento tanto para fotos del vehículo vendido como para fotos de vehículos en intercambio.
- [ ] En operations/route.ts el procesamiento Sharp ocurre antes de abrir la transacción Prisma.
- [ ] La respuesta de los endpoints no incluye ningún campo `fotosRechazadas`.

## Pruebas

### Pruebas unitarias

1. **Foto válida:** Mockear `processVehiclePhoto` para retornar `{ full, thumb }`. Verificar que se persiste con `datosThumb` no nulo y `mimeType = "image/webp"`.
2. **Foto inválida (bypass):** Mockear `processVehiclePhoto` para lanzar `ImageTooSmallError`. Verificar que el handler retorna status 400 con mensaje descriptivo.
3. **Error inesperado de Sharp:** Mockear para lanzar un `Error` genérico. Verificar que el handler retorna status 500.

### Pruebas de integración

1. **POST /api/stock con foto real válida:** Subir una imagen ≥ 800px y verificar que el registro `VehiclePhoto` en BD tiene `datosThumb` no nulo y `mimeType = "image/webp"`.
2. **POST /api/stock con foto inválida (bypass):** Llamar al endpoint directamente con una imagen < 800px y verificar que responde 400.
