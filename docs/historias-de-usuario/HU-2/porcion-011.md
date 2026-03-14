# porcion-011 — Formulario de operación con intercambio [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-012
**Tipo:** FRONT
**Prerequisitos:** porcion-009
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Extender el formulario de nueva operación para soportar el tipo "Venta con intercambio". Cuando se selecciona este tipo, se habilita un segundo formulario para agregar vehículos tomados como parte de pago. El usuario puede agregar múltiples vehículos de intercambio antes de guardar la operación.

## Ejemplo de uso

El usuario crea una nueva operación y selecciona tipo "Venta con intercambio". Aparece un segundo formulario con campos: marca, modelo, año, patente, versión, color, kilómetros, precio negociado, notas mecánicas, notas generales. Completa los datos de un vehículo usado tomado como parte de pago y hace clic en "Agregar vehículo". El vehículo se agrega a una lista temporal visible. Puede agregar más vehículos. Al hacer clic en "Guardar operación", se envía todo junto al backend.

## Criterios de aceptación

- [ ] Cuando se selecciona tipo de operación "Venta con intercambio", aparece un segundo formulario para vehículos de intercambio
- [ ] El formulario de intercambio muestra campos: marca (selector), modelo (text), año (number), patente (text), versión (text), color (text), kilómetros (number), precioNegociado (number), notasMecanicas (textarea), notasGenerales (textarea)
- [ ] Los campos requeridos del formulario de intercambio son: marca, modelo, año, patente, precioNegociado
- [ ] Hay un botón "Agregar vehículo de intercambio" que valida y agrega el vehículo a una lista temporal
- [ ] Los vehículos agregados se muestran en una lista con opción de eliminar cada uno
- [ ] Se puede agregar múltiples vehículos de intercambio antes de guardar la operación
- [ ] Al hacer clic en "Guardar operación", se envía la operación principal más el array de vehículos de intercambio
- [ ] Si no se selecciona "Venta con intercambio", el formulario de intercambio no se muestra
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El formulario de intercambio solo se muestra cuando el tipo de operación es "Venta con intercambio"
- [ ] El botón "Agregar vehículo" valida los campos requeridos antes de agregar a la lista
- [ ] Los vehículos agregados se almacenan correctamente en el estado temporal
- [ ] El botón "Eliminar" de un vehículo lo remueve correctamente de la lista temporal
- [ ] El payload enviado al backend incluye el array de vehículos de intercambio

### Pruebas de integración

- [ ] Al cambiar el tipo de operación a "Venta con intercambio", el formulario de intercambio aparece
- [ ] Al cambiar el tipo de operación a otro tipo, el formulario de intercambio desaparece y limpia los vehículos temporales
- [ ] Al hacer clic en "Guardar operación" con vehículos de intercambio, se envía POST /operations con el campo vehiculosIntercambio
- [ ] Si el backend devuelve error, los vehículos temporales se mantienen en el formulario (no se pierden)
