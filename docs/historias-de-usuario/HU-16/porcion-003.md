2# porcion-003 — UI de imagen principal para fotos nuevas [FRONT]

**Historia de usuario:** HU-16: Límite de fotos y selección de imagen principal por vehículo
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-001
**Estado:** 🔄 En progreso

## Descripción

Agregar en `VehicleFieldsForm.tsx` el indicador visual de imagen principal y el botón "Establecer como principal" para las fotos recién cargadas (no guardadas aún). La primera foto del array (`data.photos[0]`) es siempre la principal. Mover una foto a la primera posición actualiza el array en estado.

No requiere cambios en backend: `CreateVehicleForm` ya envía las fotos en orden de array con `foto_orden_${index}`, por lo que la foto en index 0 queda con `orden: 0` automáticamente.

## Archivos a modificar

- `src/components/stock/VehicleFieldsForm.tsx`

## Cambios

### Badge "Principal" en la primera foto

En la galería de "Fotos seleccionadas", cuando `index === 0`, renderizar un badge superpuesto sobre la esquina inferior-izquierda de la foto (encima del gradiente con el nombre de archivo):

```tsx
{index === 0 && (
  <div className="absolute bottom-0 left-0 flex items-center gap-1 bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
    <span className="material-symbols-outlined text-sm">star</span>
    Principal
  </div>
)}
```

### Botón "Establecer como principal" en fotos que no son la primera

En cada foto con `index > 0`, agregar un botón que aparece al hover (mismo patrón que el botón de eliminar, pero posicionado en la esquina inferior-izquierda o con ícono de estrella):

```tsx
{index > 0 && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      handlers.setPhotos((prev) => {
        const updated = [...prev];
        const [selected] = updated.splice(index, 1);
        return [selected, ...updated];
      });
    }}
    className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white opacity-0 shadow-lg transition-opacity hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group-hover:opacity-100"
    disabled={disabled}
    aria-label="Establecer como foto principal"
  >
    <span className="material-symbols-outlined text-lg">star</span>
  </button>
)}
```

### Nombre de archivo (gradiente inferior)

Cuando hay badge "Principal", el nombre de archivo se desplaza o se oculta para no superponerse. Mostrar el nombre solo cuando `index > 0`.

## Criterios de aceptación

- [ ] La primera foto siempre muestra el badge "Principal"
- [ ] Las fotos que no son la primera muestran el botón de estrella al hacer hover
- [ ] Al hacer clic en la estrella de una foto, esa foto pasa a ser la primera y muestra el badge "Principal"
- [ ] La foto que era principal pasa a otra posición y deja de mostrar el badge
- [ ] Con una sola foto cargada, muestra el badge "Principal" y no hay botón de estrella
- [ ] Al guardar en CreateVehicleForm, la foto marcada como principal queda con `orden: 0` en BD

## Pruebas

- [ ] Cargar 3 fotos → foto 1 tiene badge "Principal", fotos 2 y 3 tienen estrella al hover
- [ ] Hacer clic en estrella de foto 3 → foto 3 pasa a primera posición con badge "Principal"
- [ ] Cargar 1 foto → badge "Principal" visible, sin botón de estrella
- [ ] Guardar y verificar en BD que `VehiclePhoto` con `orden: 0` corresponde a la foto marcada como principal
