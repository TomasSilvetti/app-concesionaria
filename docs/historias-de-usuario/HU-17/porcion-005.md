# porcion-005 — Endpoint de fotos: soporte para versión thumbnail (`?thumb=true`) [BACK]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** completada
**Completada el:** 2026-06-25

## Descripción

Modificar el endpoint `GET /api/stock/[id]/photos/[photoId]` para que acepte el parámetro de query `thumb=true`. Cuando el parámetro está presente:

- Si la foto tiene `datosThumb` no nulo, responde con los bytes de `datosThumb`.
- Si la foto fue creada antes de la migración (`datosThumb` es `null`), responde con `datos` como fallback (comportamiento degradado graceful).

Cuando el parámetro no está presente (o es distinto de `"true"`), el comportamiento es idéntico al actual: devuelve `datos`.

El campo `mimeType` siempre es el almacenado en el registro (`"image/webp"` para fotos nuevas, o el tipo original para fotos viejas).

**Archivo a modificar:**
- `src/app/api/stock/[id]/photos/[photoId]/route.ts`

## Ejemplo de uso

```
GET /api/stock/abc123/photos/photo456         → devuelve datos (versión full)
GET /api/stock/abc123/photos/photo456?thumb=true → devuelve datosThumb (o datos si thumb es null)
```

```typescript
// En el handler GET
const thumb = _req.nextUrl.searchParams.get("thumb") === "true";
const photo = await prisma.vehiclePhoto.findUnique({
  where: { id: photoId },
  select: { datos: true, datosThumb: true, mimeType: true, nombreArchivo: true },
});

const imageData = thumb && photo.datosThumb ? photo.datosThumb : photo.datos;

return new NextResponse(new Uint8Array(imageData), {
  headers: {
    "Content-Type": photo.mimeType,
    "Content-Disposition": `inline; filename="${photo.nombreArchivo}"`,
    "Cache-Control": "private, max-age=3600",
  },
});
```

## Criterios de aceptación

- [ ] `GET /api/stock/[id]/photos/[photoId]` sin parámetros devuelve `datos` (comportamiento actual sin cambios).
- [ ] `GET /api/stock/[id]/photos/[photoId]?thumb=true` devuelve `datosThumb` cuando el campo no es nulo.
- [ ] Si `datosThumb` es `null` (foto pre-migración) y se solicita `?thumb=true`, devuelve `datos` como fallback sin error.
- [ ] El header `Content-Type` siempre refleja el `mimeType` almacenado en el registro.
- [ ] Las validaciones de autenticación y pertenencia al cliente no se modifican.

## Pruebas

### Pruebas unitarias

1. **thumb=true con datosThumb disponible:** Mockear Prisma con un registro que tiene `datosThumb` no nulo y verificar que la respuesta contiene los bytes de `datosThumb`.
2. **thumb=true con datosThumb null (fallback):** Mockear un registro con `datosThumb = null` y verificar que devuelve `datos` sin lanzar error.
3. **Sin parámetro thumb:** Verificar que siempre devuelve `datos` independientemente del valor de `datosThumb`.

### Pruebas de integración

1. **Flujo completo post-procesamiento:** Crear un vehículo con foto procesada por Sharp (porcion-003 ya aplicada), obtenerla con `?thumb=true` y verificar que los bytes devueltos son un WebP válido de ≤ 400px en su lado más largo.
