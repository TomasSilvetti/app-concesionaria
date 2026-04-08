# porcion-004 — Agregar botones de eliminar al buscador de Marca y Categoría en formulario de edición de operación [FRONT]

**Módulo:** Operaciones
**Tipo de porción:** Fix
**Porción original:** N/A
**Prerequisitos:** Ninguno
**estado**: completada

## Descripción

En el formulario de edición de operación (`operaciones/[id]/edit/page.tsx`), los campos Marca y Categoría ya usan el patrón de buscador en tiempo real con opción de crear, pero les faltan los botones de eliminar en los ítems del dropdown. Este fix agrega esa funcionalidad, dejando el comportamiento idéntico al de `VehicleFieldsForm.tsx`.

El cambio aplica a **dos secciones** dentro del mismo archivo:
1. **Sección principal** ("Datos del Vehículo"): buscadores `vehicleMarca` y `vehicleCategoria` (~líneas 897–1017)
2. **Sección de vehículos de parte** ("Vehículo N"): buscadores `marcaQuery` y `categoriaQuery` de cada ítem en `exchangeVehicles` (~líneas 1490–1580)

**Archivo a modificar:** `src/app/operaciones/[id]/edit/page.tsx`

Para cada buscador se debe agregar:
- Estado: `confirmDeleteMarcaId`, `isDeletingMarcaId`, `deletedMarcaIds` (Set) — y equivalentes para categoría
- Handler `handleDeleteMarca(id)`: llama DELETE a `/api/vehicle-brands/${id}`, si responde ok agrega el id al Set de eliminados y limpia la selección si era la activa
- Handler `handleDeleteCategoria(id)`: llama DELETE a `/api/vehicle-categories/${id}`, mismo comportamiento
- En el JSX del dropdown, cada botón de ítem pasa a ser una fila con el nombre a la izquierda y el botón de eliminar a la derecha (con estado de confirmación inline igual a VehicleFieldsForm)

Para la sección de vehículos de parte, los mismos estados/handlers aplican globalmente (no por vehículo individual, ya que las marcas y categorías son entidades globales).

## Estado actual vs estado esperado

**Hoy:** Los dropdowns de Marca y Categoría en el formulario de edición de operación muestran los ítems como botones simples sin posibilidad de eliminarlos. El módulo de stock (VehicleFieldsForm) sí tiene esta funcionalidad.

**Debería:** Cada ítem en los dropdowns de Marca y Categoría muestra un botón de eliminar (ícono de tacho) a la derecha. Al hacer clic, aparece una confirmación inline (Sí / No). Al confirmar, el ítem desaparece del dropdown. Si era el seleccionado, el campo se limpia. La misma funcionalidad aplica tanto en la sección principal como en la sección de vehículos de parte.

## Criterios de aceptación

- [ ] Cada ítem del dropdown de Marca (sección principal) tiene botón de eliminar con confirmación inline
- [ ] Cada ítem del dropdown de Categoría (sección principal) tiene botón de eliminar con confirmación inline
- [ ] Al eliminar una marca que estaba seleccionada, `vehicleMarcaId` se limpia y `vehicleMarcaQuery` queda en `""`
- [ ] Al eliminar una categoría que estaba seleccionada, `vehicleCategoriaId` se limpia y `vehicleCategoriaQuery` queda en `""`
- [ ] Los mismos botones de eliminar aparecen en los dropdowns de Marca y Categoría de la sección de vehículos de parte
- [ ] Si la marca/categoría eliminada estaba seleccionada en algún vehículo de parte, ese campo también se limpia
- [ ] La eliminación persiste correctamente (la marca/categoría eliminada no reaparece al abrir el dropdown nuevamente)
- [ ] La funcionalidad de crear ("Crear X") y seleccionar ítems existentes sigue funcionando sin cambios
- [ ] La operación de guardado del formulario no se ve afectada
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al confirmar la eliminación de una marca, el id se agrega a `deletedMarcaIds` y ya no aparece en los resultados filtrados
- [ ] Al eliminar la marca actualmente seleccionada en el vehículo principal, `vehicleMarcaId` queda en `""` y `vehicleMarcaQuery` queda en `""`
- [ ] Al cancelar la confirmación de eliminación, el ítem permanece en la lista y el estado `confirmDeleteMarcaId` vuelve a `null`
- [ ] La eliminación de una marca en la sección principal también impacta en los dropdowns de vehículos de parte (misma lista de marcas)

### Pruebas de integración

- [ ] Flujo completo: editar operación → abrir dropdown de Marca → eliminar una marca → confirmar → cerrar dropdown → abrir de nuevo → la marca eliminada no aparece. Guardar la operación funciona correctamente.
- [ ] Verificar que eliminar una marca desde el formulario de edición de operación también la elimina desde el módulo de Stock (son la misma entidad global).
