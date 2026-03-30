# porcion-001 — Compresión client-side en `VehicleFieldsForm` [FRONT]

**Historia de usuario:** HU-19: Compresión client-side de fotos de vehículos
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-30

## Descripción

Agregar una función de compresión de imágenes usando la Canvas API del navegador dentro de `VehicleFieldsForm`. Cuando el usuario selecciona fotos, cada archivo se comprime antes de guardarse en el estado: se genera una versión full (máx 1280px, WebP calidad 0.85) y una versión thumbnail (máx 400px, WebP calidad 0.85).

El tipo `PhotoFile` se actualiza para incluir el thumbnail comprimido (`thumbBlob`). El `File` original se reemplaza por un `Blob` comprimido en `file`.

**Archivos a modificar:**
- `src/components/stock/VehicleFieldsForm.tsx` — función de compresión + actualización de `handlePhotoSelect` + actualización de la interfaz `PhotoFile`

## Especificación técnica

### Interfaz `PhotoFile` actualizada

```typescript
export interface PhotoFile {
  id: string;
  file: Blob;       // versión full comprimida (1280px WebP)
  thumbBlob: Blob;  // versión thumbnail comprimida (400px WebP)
  preview: string;
}
```

### Función de compresión (Canvas API)

```typescript
async function compressImage(
  file: File,
  maxPx: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("No se pudo comprimir la imagen"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo cargar la imagen")); };
    img.src = url;
  });
}
```

### `handlePhotoSelect` actualizado

```typescript
const handlePhotoSelect = async (files: FileList | null) => {
  if (!files) return;
  setPhotoErrors([]);

  const validFiles = Array.from(files).filter(
    (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
  );

  const compressed = await Promise.all(
    validFiles.map(async (file) => {
      const [full, thumb] = await Promise.all([
        compressImage(file, 1280, 0.85),
        compressImage(file, 400, 0.85),
      ]);
      return { full, thumb, file };
    })
  );

  handlers.setPhotos((prev) => {
    const existingCount = (stockPhotoIds?.length ?? 0) + prev.length;
    const slots = Math.max(0, 10 - existingCount);
    const toAdd = compressed.slice(0, slots).map(({ full, thumb, file }) => ({
      id: crypto.randomUUID(),
      file: full,
      thumbBlob: thumb,
      preview: URL.createObjectURL(full),
    }));
    return [...prev, ...toAdd];
  });
};
```

## Criterios de aceptación

- [ ] La interfaz `PhotoFile` incluye `thumbBlob: Blob` y `file` es de tipo `Blob`.
- [ ] Al seleccionar una foto, `handlePhotoSelect` genera full + thumb comprimidos antes de guardar en estado.
- [ ] El preview del formulario sigue funcionando correctamente (usa la versión full comprimida).
- [ ] Fotos de más de 10MB son ignoradas (sin cambio respecto al comportamiento actual).
- [ ] No se importa ninguna librería externa; solo se usa Canvas API nativa.

## Pruebas

1. Seleccionar una foto de 5MB → verificar en DevTools que el blob en estado pesa considerablemente menos.
2. Seleccionar una foto de 4000x3000px → verificar que el preview se muestra correctamente.
3. Seleccionar 10 fotos → verificar que el límite de slots sigue funcionando.
4. Verificar que no hay errores de compilación TypeScript por el cambio de tipo en `PhotoFile`.
