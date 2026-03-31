# porcion-003 — Edición de vehículo: envío full+thumb + backend PUT [FRONT + BACK]

**Historia de usuario:** HU-19: Compresión client-side de fotos de vehículos
**Par:** —
**Tipo:** FRONT + BACK
**Prerequisitos:** porcion-001
**Estado:** completado

## Descripción

Actualizar `EditVehicleForm` para enviar tanto la versión full como el thumbnail de cada foto nueva en el FormData. Actualizar el endpoint PUT `/api/stock/[id]` para leer los thumbnails directamente del FormData y eliminar el llamado a `processVehiclePhoto`.

**Archivos a modificar:**
- `src/components/stock/EditVehicleForm.tsx` — actualizar el armado del FormData
- `src/app/api/stock/[id]/route.ts` — leer `fotosThumb_${index}`, eliminar `processVehiclePhoto`

## Especificación técnica

### `EditVehicleForm` — identificar y actualizar el armado del FormData

Buscar el bloque donde se agregan las fotos nuevas al FormData (similar a `CreateVehicleForm`) y agregar el campo thumb paralelo:

```typescript
// Antes:
fotos.forEach((photo) => {
  formData.append("fotos", photo.file);
});

// Después:
fotos.forEach((photo, index) => {
  formData.append("fotos", photo.file);
  formData.append(`fotosThumb_${index}`, photo.thumbBlob);
});
```

### `api/stock/[id]/route.ts` (PUT) — leer thumbnails, eliminar processVehiclePhoto

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
      : fullBuffer; // fallback
    photosData.push({
      id: randomUUID(),
      stockId: vehicle.id,
      nombreArchivo: foto.name,
      mimeType: "image/webp",
      datos: fullBuffer,
      datosThumb: thumbBuffer,
      orden: fotoReorden.length + index,
      creadoEn: now,
    });
  }
  await prisma.vehiclePhoto.createMany({ data: photosData });
}
```

## Criterios de aceptación

- [ ] Al editar un vehículo agregando fotos pesadas, la request no produce error 413.
- [ ] Las nuevas fotos tienen `datos` y `datosThumb` correctamente poblados.
- [ ] Las fotos existentes del vehículo no se ven afectadas (no se reescriben).
- [ ] El reordenamiento de fotos existentes sigue funcionando correctamente.
- [ ] El import de `processVehiclePhoto` se elimina del archivo de la ruta PUT.

## Pruebas

1. Editar un vehículo existente y agregar 5 fotos de ~3MB → no debe producir 413.
2. Verificar que las fotos previas del vehículo siguen intactas.
3. Verificar que el reordenamiento de fotos existentes sigue funcionando.
4. Verificar que el thumbnail de las fotos nuevas se sirve correctamente con `?thumb=true`.
