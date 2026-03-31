# porcion-004 — Compresión fotos trade-in en operaciones [FRONT + BACK]

**Historia de usuario:** HU-19: Compresión client-side de fotos de vehículos
**Par:** —
**Tipo:** FRONT + BACK
**Prerequisitos:** porcion-001
**Estado:** completado

## Descripción

Agregar compresión client-side en `CreateOperationForm` para las fotos de vehículos en parte de pago (trade-in). Actualizar el endpoint POST `/api/operations` para leer los thumbnails desde el FormData y eliminar el llamado a `processVehiclePhoto` para ambos flujos de fotos que maneja (fotos del vehículo vendido y fotos de vehículos en intercambio).

**Archivos a modificar:**
- `src/components/operations/CreateOperationForm.tsx` — comprimir en `handleTradeInPhotoSelect`, enviar thumbs en FormData
- `src/app/api/operations/route.ts` — leer thumbnails indexados, eliminar `processVehiclePhoto`

## Contexto

El endpoint `/api/operations` (POST) procesa fotos en dos lugares:
1. **Fotos del vehículo vendido** (`fotos`): cuando no hay `stockVehicleId` (vehículo nuevo, no del stock).
2. **Fotos de vehículos en intercambio** (`vehiculosUsadoFotos_${i}`): para cada vehículo en parte de pago.

Ambos flujos usan `processVehiclePhoto` server-side hoy. Ambos deben pasar a leer los thumbnails del FormData.

## Especificación técnica

### `CreateOperationForm` — `handleTradeInPhotoSelect`

Agregar la misma función `compressImage` (Canvas API) definida en porcion-001 e integrarla en el handler de fotos trade-in:

```typescript
const handleTradeInPhotoSelect = async (files: FileList | null) => {
  if (!files) return;
  setTradeInPhotoErrors([]);

  const validFiles = Array.from(files).filter(
    (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
  );

  const compressed = await Promise.all(
    validFiles.map(async (file) => {
      const [full, thumb] = await Promise.all([
        compressImage(file, 1280, 0.85),
        compressImage(file, 400, 0.85),
      ]);
      return { full, thumb };
    })
  );

  setTradeInPhotos((prev) => [
    ...prev,
    ...compressed.map(({ full, thumb }) => ({
      id: crypto.randomUUID(),
      file: full,
      thumbBlob: thumb,
      preview: URL.createObjectURL(full),
    })),
  ]);
};
```

### `CreateOperationForm` — FormData actualizado para trade-in

```typescript
// Antes:
vehicle.photos.forEach((photo) => {
  formData.append(`vehiculosUsadoFotos_${index}`, photo.file);
});

// Después:
vehicle.photos.forEach((photo, photoIndex) => {
  formData.append(`vehiculosUsadoFotos_${index}`, photo.file);
  formData.append(`vehiculosUsadoFotosThumb_${index}_${photoIndex}`, photo.thumbBlob);
});
```

### `api/operations/route.ts` — fotos del vehículo vendido

```typescript
// Eliminar import:
// import { processVehiclePhoto } from "@/lib/imageProcessor";

// Reemplazar bloque de fotosVendidoProcesadas:
if (!stockVehicleId && fotos.length > 0) {
  for (const [index, foto] of fotos.entries()) {
    const fullBuffer = Buffer.from(await foto.arrayBuffer());
    const thumbFile = formData.get(`fotosThumb_${index}`) as File | null;
    const thumbBuffer = thumbFile
      ? Buffer.from(await thumbFile.arrayBuffer())
      : fullBuffer;
    fotosVendidoProcesadas.push({
      id: randomUUID(),
      nombreArchivo: foto.name,
      mimeType: "image/webp",
      datos: fullBuffer,
      datosThumb: thumbBuffer,
      orden: index,
      creadoEn: now,
    });
  }
}
```

### `api/operations/route.ts` — fotos de vehículos en intercambio

```typescript
// Reemplazar bloque de fotosIntercambioProcesadas:
const vuFotos = formData.getAll(`vehiculosUsadoFotos_${i}`) as File[];
const processed: ProcessedPhoto[] = [];
for (const [photoIndex, foto] of vuFotos.entries()) {
  const fullBuffer = Buffer.from(await foto.arrayBuffer());
  const thumbFile = formData.get(`vehiculosUsadoFotosThumb_${i}_${photoIndex}`) as File | null;
  const thumbBuffer = thumbFile
    ? Buffer.from(await thumbFile.arrayBuffer())
    : fullBuffer;
  processed.push({
    id: randomUUID(),
    nombreArchivo: foto.name,
    mimeType: "image/webp",
    datos: fullBuffer,
    datosThumb: thumbBuffer,
    orden: photoIndex,
    creadoEn: now,
  });
}
fotosIntercambioProcesadas.push(processed);
```

## Criterios de aceptación

- [ ] Al seleccionar fotos para un vehículo en parte de pago, se comprimen client-side antes de guardarse en estado.
- [ ] El FormData enviado incluye los thumbnails de trade-in indexados correctamente.
- [ ] Crear una operación con vehículos en parte de pago con fotos pesadas no produce error 413.
- [ ] Las fotos de los vehículos en intercambio se visualizan correctamente en la operación creada.
- [ ] El import de `processVehiclePhoto` se elimina del endpoint de operaciones.

## Pruebas

1. Crear una operación con 1 vehículo en parte de pago con 5 fotos de ~3MB → no debe producir 413.
2. Verificar que las fotos del vehículo en intercambio se ven correctamente en el detalle de la operación.
3. Verificar que el thumbnail se sirve correctamente (`?thumb=true`) para esas fotos.
4. Verificar que el flujo de operaciones sin fotos sigue funcionando sin errores.
