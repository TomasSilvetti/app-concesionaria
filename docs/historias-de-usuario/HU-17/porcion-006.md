# porcion-006 — Lazy loading y placeholders en detalle de vehículo [FRONT]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-005

## Descripción

Modificar el componente `VehicleDetailView.tsx` para mejorar la carga de fotos en la vista de detalle:

1. **Foto principal:** Cambiar la URL a `?thumb=false` (es decir, sin parámetro, usa full por defecto). Agregar un **placeholder visible** mientras se descarga: un `<div>` con fondo gris y spinner o skeleton que desaparece cuando la imagen termina de cargar (evento `onLoad`). La imagen principal carga con `loading="eager"` (prioritaria).

2. **Fotos secundarias (tira de miniaturas):** Cambiar las URLs a `?thumb=true` para servir la versión thumbnail (400px). Agregar `loading="lazy"` a cada `<img>` para que el navegador las solicite solo cuando las necesita.

3. **Sin fotos:** Cuando `photos.length === 0`, mostrar el placeholder genérico de auto (ícono centrado sobre fondo gris) tanto en el espacio de foto principal como en el área de la tira.

Los datos textuales (marca, modelo, año, precio, etc.) ya se renderizan en el componente sin depender de las fotos, por lo que no requieren cambios adicionales para ser visibles de inmediato.

**Archivo a modificar:**
- `src/components/stock/VehicleDetailView.tsx`

## Ejemplo de uso

```tsx
{/* Foto principal con placeholder */}
<div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
  {!mainPhotoLoaded && (
    <div className="absolute inset-0 animate-pulse bg-zinc-300 dark:bg-zinc-700" />
  )}
  {currentPhoto ? (
    <img
      src={`/api/stock/${vehicleId}/photos/${currentPhoto.id}`}
      alt="Foto principal"
      loading="eager"
      onLoad={() => setMainPhotoLoaded(true)}
      className={`w-full h-full object-cover transition-opacity ${mainPhotoLoaded ? "opacity-100" : "opacity-0"}`}
    />
  ) : (
    <div className="flex items-center justify-center h-full">
      {/* ícono genérico de auto */}
    </div>
  )}
</div>

{/* Tira de miniaturas con lazy loading */}
{photos.length > 1 && (
  <div className="flex gap-2 mt-2">
    {photos.map((photo, index) => (
      <img
        key={photo.id}
        src={`/api/stock/${vehicleId}/photos/${photo.id}?thumb=true`}
        loading="lazy"
        alt={`Miniatura ${index + 1}`}
        className="..."
        onClick={() => setPhotoIndex(index)}
      />
    ))}
  </div>
)}
```

## Criterios de aceptación

- [ ] Mientras la foto principal se descarga, se muestra un placeholder visible (skeleton o fondo gris) en su espacio.
- [ ] Una vez cargada la foto principal, el placeholder desaparece y la imagen es visible.
- [ ] La foto principal se solicita en versión full (sin `?thumb=true`).
- [ ] Las fotos secundarias en la tira de miniaturas usan `loading="lazy"` y se solicitan con `?thumb=true`.
- [ ] Si el vehículo no tiene fotos, se muestra el placeholder genérico en el espacio de foto principal y no se renderiza la tira de miniaturas.
- [ ] Los datos textuales del detalle (marca, modelo, año, precio) son visibles sin esperar a que carguen las fotos.
- [ ] La vista de detalle es responsiva: se ve correctamente en pantallas de escritorio (≥ 1024px) y móvil (< 768px). *(criterio de responsividad obligatorio)*

## Pruebas

### Pruebas unitarias

1. **Con fotos:** Renderizar `VehicleDetailView` con un vehículo con 3 fotos y verificar que la foto principal tiene `loading="eager"` y los `<img>` de la tira tienen `loading="lazy"` y sus `src` contienen `?thumb=true`.
2. **Sin fotos:** Renderizar con `photos = []` y verificar que no hay ningún `<img>` de fotos y sí hay el elemento placeholder genérico.
3. **Placeholder inicial:** Verificar que antes de disparar el evento `onLoad`, el elemento skeleton/placeholder está presente en el DOM.

### Pruebas de integración

1. **Carga completa del detalle:** Montar el componente con datos reales de un vehículo con fotos, simular el evento `onLoad` de la imagen principal y verificar que el placeholder desaparece y la imagen es visible.
