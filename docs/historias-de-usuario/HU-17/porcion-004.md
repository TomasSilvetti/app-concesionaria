# porcion-004 — Miniaturas de vehículos en listado de stock [FRONT]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** porcion-005
**Estado:** ✅ Completada
**Completada el:** 2026-03-26

## Descripción

Modificar el componente `StockTable.tsx` para que las imágenes de vehículos en el listado se soliciten usando el parámetro `?thumb=true` en la URL del endpoint de fotos. Actualmente usan la URL `/api/stock/${vehicle.id}/photos/${vehicle.fotoId}` (versión full). Con esta porción pasarán a usar `/api/stock/${vehicle.id}/photos/${vehicle.fotoId}?thumb=true` para obtener la versión thumbnail (400px WebP), que es significativamente más liviana.

También se debe mostrar el **placeholder genérico** cuando `vehicle.fotoId` es `null` (vehículo sin fotos). Este placeholder puede ser el ícono de auto ya existente en el componente, o un `<div>` con un ícono SVG de auto centrado sobre fondo gris claro, siguiendo el estilo visual del sistema.

**Archivos a modificar:**
- `src/components/stock/StockTable.tsx`

## Ejemplo de uso

```tsx
// Antes
<img src={`/api/stock/${vehicle.id}/photos/${vehicle.fotoId}`} ... />

// Después
{vehicle.fotoId ? (
  <img
    src={`/api/stock/${vehicle.id}/photos/${vehicle.fotoId}?thumb=true`}
    alt={`${vehicle.marca} ${vehicle.modelo}`}
    className="..."
  />
) : (
  <div className="flex items-center justify-center w-full h-full bg-zinc-100 dark:bg-zinc-800 rounded">
    {/* ícono genérico de auto */}
  </div>
)}
```

## Criterios de aceptación

- [ ] Las imágenes en el listado de stock usan la URL con `?thumb=true`.
- [ ] Si `vehicle.fotoId` es `null`, se muestra un placeholder genérico (ícono o imagen) en lugar de un `<img>` roto.
- [ ] El placeholder ocupa el mismo espacio visual que una miniatura real.
- [ ] No hay regresiones visuales en las celdas de foto del listado.
- [ ] El componente es responsivo: las miniaturas se ven correctamente en pantallas de escritorio y tablet (≥ 768px). *(criterio de responsividad obligatorio)*

## Pruebas

### Pruebas unitarias

1. **Con fotoId:** Renderizar `StockTable` con un vehículo que tiene `fotoId` y verificar que el atributo `src` del `<img>` contiene `?thumb=true`.
2. **Sin fotoId:** Renderizar con `fotoId = null` y verificar que no se renderiza ningún `<img>` con `src` de fotos, sino el elemento placeholder.

### Pruebas de integración

1. **Listado completo:** Montar el componente con un array mixto de vehículos (algunos con foto, algunos sin) y verificar que cada fila muestra el elemento correcto (thumbnail o placeholder) sin errores de consola.
