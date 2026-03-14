# porcion-015 — Documento de operación — modo edición [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-016
**Tipo:** FRONT
**Prerequisitos:** porcion-013
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Extender la página de documento de operación para soportar modo edición. En este modo, los campos editables se convierten en inputs, se puede cambiar el estado, modificar fechas, precios y gastos asociados. Al guardar, se envían solo los campos modificados al backend. Incluye validación de fechas y recálculo automático de ganancia neta y comisión.

## Ejemplo de uso

El usuario hace clic en "Editar" desde el documento de operación. Los campos se convierten en inputs editables. Cambia la fechaVenta de null a "20/03/2026", modifica ingresosBrutos de "$28.000" a "$29.000" y cambia el estado de "abierta" a "cerrada". El sistema recalcula automáticamente la ganancia neta y comisión y los muestra actualizados. Hace clic en "Guardar cambios" y la operación se actualiza.

## Criterios de aceptación

- [ ] En modo edición, los campos editables se convierten en inputs: fechaInicio, fechaVenta, modelo, año, patente, precioVentaTotal, ingresosBrutos, estado
- [ ] Los selectores de marca, categoría y tipo de operación son editables
- [ ] El campo gastosAsociados es de solo lectura (se actualiza automáticamente desde el módulo de Gastos)
- [ ] Cuando se modifica ingresosBrutos o gastosAsociados, se recalcula automáticamente ingresosNetos y comision en tiempo real
- [ ] Se valida que fechaVenta no sea anterior a fechaInicio
- [ ] Hay un botón "Guardar cambios" que envía los datos modificados al backend
- [ ] Hay un botón "Cancelar" que descarta los cambios y vuelve al modo solo lectura
- [ ] Mientras se envía la petición, el botón "Guardar" muestra un indicador de carga
- [ ] Los vehículos de intercambio y gastos asociados no son editables desde aquí (solo lectura)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente detecta correctamente qué campos fueron modificados
- [ ] El componente recalcula correctamente ingresosNetos cuando cambia ingresosBrutos
- [ ] El componente recalcula correctamente comision cuando cambia ingresosNetos
- [ ] El componente valida que fechaVenta no sea anterior a fechaInicio
- [ ] El botón "Guardar" está deshabilitado si hay errores de validación

### Pruebas de integración

- [ ] Al hacer clic en "Guardar cambios", se envía PATCH /operations/:id con solo los campos modificados
- [ ] Si el backend devuelve 200 OK, se muestra mensaje de éxito y se actualiza la vista con los nuevos datos
- [ ] Si el backend devuelve error, se muestra el mensaje de error sin cambiar el modo edición
- [ ] Al hacer clic en "Cancelar", se descartan los cambios y se vuelve al modo solo lectura con los datos originales
