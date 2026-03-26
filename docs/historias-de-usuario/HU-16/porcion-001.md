# porcion-001 — Límite de 10 fotos en el formulario [FRONT]

**Historia de usuario:** HU-16: Límite de fotos y selección de imagen principal por vehículo
**Par:** porcion-002
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completada

## Descripción

Agregar en `VehicleFieldsForm.tsx` la validación de máximo 10 fotos por vehículo. Incluye: bloquear la selección cuando se alcanza el límite, mostrar un contador visible, y actualizar el hint de la zona de carga.

## Archivos a modificar

- `src/components/stock/VehicleFieldsForm.tsx`

## Cambios

- **`handlePhotoSelect`**: calcular el total de fotos resultante (`stockPhotoIds?.length ?? 0` + `data.photos.length` + `newPhotos.length`). Si supera 10, tomar solo las que caben hasta completar el máximo; ignorar el resto silenciosamente.
- **Header de la sección "Fotos del Vehículo"**: agregar contador dinámico `(X/10)` junto al título, donde X es la suma de fotos existentes + fotos nuevas.
- **Zona de drag & drop**: cuando el total sea 10, agregar `pointer-events-none opacity-50` y cambiar el texto principal a "Límite de fotos alcanzado". Deshabilitar también el `<input type="file">`.
- **Hint de formatos**: actualizar a "JPG, PNG o WEBP hasta 10MB — máximo 10 fotos por vehículo".

## Criterios de aceptación

- [ ] Con 0 fotos, la zona de carga funciona normalmente y muestra "0/10"
- [ ] Al llegar a 10 fotos (sumando existentes + nuevas), la zona de carga se deshabilita y muestra "10/10"
- [ ] Si se arrastran 5 fotos cuando ya hay 8, solo se agregan 2 (las primeras del lote); las otras 3 se ignoran
- [ ] El contador se actualiza en tiempo real al agregar o eliminar fotos
- [ ] Si se eliminan fotos existentes y el total baja de 10, la zona de carga vuelve a habilitarse

## Pruebas

- [ ] Cargar 10 fotos una por una → zona bloqueada al llegar a 10
- [ ] Cargar 10 fotos de golpe (drag & drop de múltiples archivos) → se agregan las 10, zona bloqueada
- [ ] Con 8 fotos, arrastrar 5 → se agregan 2, zona bloqueada
- [ ] Eliminar 1 foto cuando hay 10 → zona se habilita nuevamente, contador muestra "9/10"
- [ ] En EditVehicleForm con 6 fotos existentes, intentar agregar 5 nuevas → solo se agregan 4
