# porcion-002 — Servicio Sharp: validación y procesamiento de imágenes [BACK]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-06-20

## Descripción

Instalar la librería **Sharp** y crear un módulo de servicio de procesamiento de imágenes en `src/lib/imageProcessor.ts`. Este servicio expone una función central `processVehiclePhoto` que recibe un `Buffer` de imagen de entrada y:

1. Valida que el lado más largo mida al menos **800px**. Si no cumple, lanza un error tipado `ImageTooSmallError`.
2. Convierte la imagen a **WebP**.
3. Genera la versión **full** (lado más largo = 1280px, sin upscaling).
4. Genera la versión **thumbnail** (lado más largo = 400px, sin upscaling).
5. Retorna `{ full: Buffer, thumb: Buffer }`.

La regla de "sin upscaling" se aplica usando la opción `withoutEnlargement: true` de Sharp.

**Instalación requerida:**
```bash
npm install sharp
npm install --save-dev @types/sharp
```

**Archivo a crear:**
- `src/lib/imageProcessor.ts`

## Ejemplo de uso

```typescript
import { processVehiclePhoto, ImageTooSmallError } from "@/lib/imageProcessor";

try {
  const { full, thumb } = await processVehiclePhoto(inputBuffer);
  // full → Buffer WebP, máximo 1280px en lado más largo
  // thumb → Buffer WebP, máximo 400px en lado más largo
} catch (error) {
  if (error instanceof ImageTooSmallError) {
    // La imagen tiene menos de 800px en su lado más largo
    console.error(error.message); // "La imagen debe tener al menos 800px en su lado más largo."
  }
}
```

## Criterios de aceptación

- [ ] La función `processVehiclePhoto(buffer: Buffer): Promise<{ full: Buffer; thumb: Buffer }>` existe y está exportada desde `src/lib/imageProcessor.ts`.
- [ ] Si el lado más largo del input es menor a 800px, se lanza `ImageTooSmallError` con el mensaje: `"La imagen debe tener al menos 800px en su lado más largo."`.
- [ ] La versión full no supera 1280px en su lado más largo; si el original es menor a 1280px, se respeta la resolución original (sin upscaling).
- [ ] La versión thumbnail no supera 400px en su lado más largo; si el original es menor a 400px, se respeta la resolución original.
- [ ] Ambas versiones generadas están en formato **WebP**.
- [ ] La clase `ImageTooSmallError` está exportada para poder usarse con `instanceof` en los endpoints.

## Pruebas

### Pruebas unitarias

1. **Imagen válida grande (1920x1080):** Verificar que `processVehiclePhoto` retorna `full` con ancho ≤ 1280px, `thumb` con ancho ≤ 400px, y ambos en formato WebP.
2. **Imagen válida pequeña (900x600):** Verificar que `full` mantiene 900x600 (sin upscaling a 1280px) y `thumb` tiene ancho ≤ 400px.
3. **Imagen demasiado pequeña (600x400):** Verificar que se lanza `ImageTooSmallError` y el mensaje es exactamente `"La imagen debe tener al menos 800px en su lado más largo."`.
4. **Imagen exactamente en el límite (800px):** Verificar que se procesa sin error (límite inclusivo).

### Pruebas de integración

1. **Buffer de imagen real:** Ejecutar `processVehiclePhoto` con un buffer de imagen PNG real de 1200x800, verificar que ambos outputs son buffers WebP válidos decodificables por Sharp.
