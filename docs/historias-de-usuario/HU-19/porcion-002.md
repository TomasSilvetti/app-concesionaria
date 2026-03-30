# porcion-002 — Creación de vehículo: envío full+thumb + backend POST [FRONT + BACK]

**Historia de usuario:** HU-19: Compresión client-side de fotos de vehículos
**Par:** —
**Tipo:** FRONT + BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-30

## Descripción

Actualizar `CreateVehicleForm` para enviar tanto la versión full como el thumbnail de cada foto en el FormData. Actualizar el endpoint POST `/api/stock` para leer los thumbnails directamente del FormData y eliminar el llamado a `processVehiclePhoto`.

**Archivos a modificar:**
- `src/components/stock/CreateVehicleForm.tsx` — actualizar el armado del FormData
- `src/app/api/stock/route.ts` — leer `fotosThumb_${index}`, eliminar `processVehiclePhoto`

## Especificación técnica

### `CreateVehicleForm` — FormData actualizado

```typescript
// Antes:
photos.forEach((photo, index) => {
  formData.append("fotos", photo.file);
  formData.append(`foto_orden_${index}`, index.toString());
});

// Después:
photos.forEach((photo, index) => {
  formData.append("fotos", photo.file);
  formData.append(`fotosThumb_${index}`, photo.thumbBlob);
  formData.append(`foto_orden_${index}`, index.toString());
});
```

### `api/stock/route.ts` (POST) — leer thumbnails, eliminar processVehiclePhoto

```typescript
// Eliminar import:
// import { processVehiclePhoto } from "@/lib/imageProcessor";

// Reemplazar el bloque de procesamiento de fotos:
if (fotos.length > 0) {
  const photosData = [];
  for (const [index, foto] of fotos.entries()) {
    const fullBuffer = Buffer.from(await foto.arrayBuffer());
    const thumbFile = formData.get(`fotosThumb_${index}`) as File | null;
    const thumbBuffer = thumbFile
      ? Buffer.from(await thumbFile.arrayBuffer())
      : fullBuffer; // fallback: usar full si no hay thumb (no debería ocurrir)
    photosData.push({
      id: randomUUID(),
      stockId: vehicle.id,
      nombreArchivo: foto.name,
      mimeType: "image/webp",
      datos: fullBuffer,
      datosThumb: thumbBuffer,
      orden: index,
      creadoEn: now,
    });
  }
  await prisma.vehiclePhoto.createMany({ data: photosData });
}
```

## Criterios de aceptación

- [ ] Al crear un vehículo con 10 fotos pesadas (ej. 3MB c/u), la request no produce error 413.
- [ ] Las fotos creadas tienen `datos` (full) y `datosThumb` (thumb) correctamente poblados en la base de datos.
- [ ] Las fotos se visualizan correctamente en el detalle del vehículo tras la creación.
- [ ] El thumbnail se sirve correctamente al acceder a `/api/stock/[id]/photos/[photoId]?thumb=true`.
- [ ] El import de `processVehiclePhoto` se elimina del archivo de la ruta POST.

## Pruebas

1. Crear un vehículo con 8 fotos de ~3MB cada una → no debe producir 413, el vehículo debe crearse exitosamente.
2. Abrir el detalle del vehículo creado → las fotos deben verse correctamente.
3. Llamar a `/api/stock/[id]/photos/[photoId]?thumb=true` → debe devolver una imagen de menor tamaño que la full.
