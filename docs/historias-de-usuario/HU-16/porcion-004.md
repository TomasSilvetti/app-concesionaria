# porcion-004 — Backend: soporte para reordenar fotos existentes [BACK]

**Historia de usuario:** HU-16: Límite de fotos y selección de imagen principal por vehículo
**Par:** porcion-005
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ⬜ Pendiente

## Descripción

Extender el handler PUT de `/api/stock/[id]` para recibir un campo `foto_reorden` en el FormData (JSON string con array de IDs de fotos en el nuevo orden deseado) y actualizar el campo `orden` de cada foto en la BD.

Esto permite que el frontend envíe el nuevo orden de las fotos existentes al guardar el formulario de edición.

## Archivos a modificar

- `src/app/api/stock/[id]/route.ts` — handler PUT

## Cambios

Después de la validación de límite y antes de insertar las fotos nuevas, procesar `foto_reorden`:

```ts
const fotoReordenRaw = formData.get("foto_reorden") as string | null;
if (fotoReordenRaw) {
  const fotoReorden: string[] = JSON.parse(fotoReordenRaw);
  await Promise.all(
    fotoReorden.map((photoId, index) =>
      prisma.vehiclePhoto.updateMany({
        where: { id: photoId, stockId: id },
        data: { orden: index },
      })
    )
  );
}
```

Puntos importantes:
- Usar `updateMany` con `where: { id: photoId, stockId: id }` para garantizar que solo se actualicen fotos que pertenezcan al vehículo (seguridad).
- Si `foto_reorden` no viene en el FormData, no hacer nada (compatibilidad con flujos que no lo usan).
- El reorden se procesa antes de agregar las fotos nuevas, para que las nuevas queden con órdenes mayores.

## Criterios de aceptación

- [ ] PUT con `foto_reorden=["id2","id1"]` actualiza `orden` de id2 a 0 y de id1 a 1 en BD
- [ ] PUT sin `foto_reorden` funciona igual que antes (no rompe el flujo existente)
- [ ] `foto_reorden` con IDs de otro vehículo no afecta esas fotos (filtro por `stockId`)
- [ ] Después del PUT, el GET del vehículo devuelve las fotos en el nuevo orden

## Pruebas

- [ ] PUT con `foto_reorden=["id2","id1"]` → GET devuelve foto id2 primero con `orden: 0`
- [ ] PUT sin `foto_reorden` → fotos mantienen su orden actual en BD
- [ ] PUT con `foto_reorden` que incluye un ID de foto de otro vehículo → ese ID se ignora, solo se actualizan los del vehículo correcto
- [ ] PUT con `foto_reorden` + fotos nuevas → fotos nuevas quedan con órdenes mayores a las existentes reordenadas
