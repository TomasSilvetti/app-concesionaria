# porcion-005 — UI de imagen principal para fotos existentes [FRONT]

**Historia de usuario:** HU-16: Límite de fotos y selección de imagen principal por vehículo
**Par:** porcion-004
**Tipo:** FRONT
**Prerequisitos:** porcion-003, porcion-004
**Estado:** ⬜ Pendiente

## Descripción

Agregar en `VehicleFieldsForm.tsx` el badge "Principal" y el botón "Establecer como principal" para las fotos ya guardadas en BD (las que se muestran en la sección "Fotos del vehículo" del formulario de edición). Conectar con `EditVehicleForm.tsx` para que el nuevo orden de las fotos existentes se envíe como `foto_reorden` al hacer submit del PUT.

## Archivos a modificar

- `src/components/stock/VehicleFieldsForm.tsx`
- `src/components/stock/EditVehicleForm.tsx`

## Cambios en `VehicleFieldsForm.tsx`

### Nueva prop

Agregar `onSetExistingPhotoAsPrincipal?: (photoId: string) => void` a la interfaz `VehicleFieldsFormProps`.

### Badge "Principal" en la primera foto existente

En la galería de "Fotos del vehículo" (`stockPhotoIds`), el primer ID del array (`stockPhotoIds[0]`) muestra el badge "Principal" (mismo estilo que en porcion-003):

```tsx
{index === 0 && (
  <div className="absolute bottom-0 left-0 flex items-center gap-1 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
    <span className="material-symbols-outlined text-sm">star</span>
    Principal
  </div>
)}
```

### Botón "Establecer como principal" en fotos existentes que no son la primera

En cada foto existente con `index > 0`, mostrar botón de estrella al hover que llama a `onSetExistingPhotoAsPrincipal?.(photoId)`:

```tsx
{index > 0 && onSetExistingPhotoAsPrincipal && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onSetExistingPhotoAsPrincipal(photoId);
    }}
    className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
    disabled={disabled}
    aria-label="Establecer como foto principal"
  >
    <span className="material-symbols-outlined text-lg">star</span>
  </button>
)}
```

## Cambios en `EditVehicleForm.tsx`

### Handler de reorden

```ts
const handleSetExistingPhotoAsPrincipal = (photoId: string) => {
  setExistingPhotoIds((prev) => {
    const updated = prev.filter((id) => id !== photoId);
    return [photoId, ...updated];
  });
};
```

### Pasar el handler al formulario

Agregar `onSetExistingPhotoAsPrincipal={handleSetExistingPhotoAsPrincipal}` en el `<VehicleFieldsForm>`.

### Enviar `foto_reorden` en el PUT

En `handleSubmit`, antes de hacer el fetch:

```ts
if (existingPhotoIds.length > 0) {
  formData.append("foto_reorden", JSON.stringify(existingPhotoIds));
}
```

## Criterios de aceptación

- [ ] En el formulario de edición, la primera foto existente muestra el badge "Principal"
- [ ] Las fotos existentes que no son la primera muestran el botón de estrella al hover
- [ ] Al hacer clic en la estrella de una foto existente, esa foto pasa a ser la primera visualmente (badge cambia)
- [ ] Al guardar, el PUT incluye `foto_reorden` con el nuevo orden
- [ ] Después de guardar, el GET del vehículo devuelve las fotos en el nuevo orden
- [ ] La tabla de stock muestra la nueva foto principal
- [ ] Si no se cambió el orden de fotos existentes, `foto_reorden` se envía igual (mismo orden) sin efectos negativos

## Pruebas

- [ ] Abrir edición de vehículo con 3 fotos → primera tiene badge "Principal", las otras tienen estrella al hover
- [ ] Hacer clic en estrella de la tercera foto → esa foto pasa a primera con badge "Principal"
- [ ] Guardar → verificar en BD que esa foto tiene `orden: 0`
- [ ] Verificar en tabla de stock que la nueva foto principal aparece como miniatura
- [ ] Abrir edición nuevamente → la foto cambiada sigue siendo la primera (badge "Principal")
