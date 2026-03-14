# porcion-009 — Formulario de nueva operación simple [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-010
**Tipo:** FRONT
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear el formulario para registrar una nueva operación simple (sin intercambio). Incluye campos para fechaInicio, modelo, año, patente, precioVentaTotal, ingresosBrutos, marca (selector), categoría (selector) y tipo de operación (selector). El formulario valida campos requeridos y envía los datos al backend.

## Ejemplo de uso

El usuario hace clic en "Nueva operación" desde el listado. Se abre un formulario con todos los campos necesarios. El usuario completa: fecha de inicio "15/03/2026", modelo "Corolla", año "2022", patente "ABC123", precio venta "$30.000", ingresos brutos "$28.000", selecciona marca "Toyota", categoría "Sedán" y tipo "Venta simple". Hace clic en "Guardar" y la operación se crea.

## Criterios de aceptación

- [ ] El formulario muestra los campos: fechaInicio (date picker), modelo (text), año (number), patente (text), precioVentaTotal (number), ingresosBrutos (number)
- [ ] El formulario muestra selectores para: marca, categoría y tipo de operación, cargados desde el backend
- [ ] Todos los campos son requeridos y muestran error si están vacíos al intentar guardar
- [ ] El campo año solo acepta números de 4 dígitos
- [ ] Los campos de precio solo aceptan números positivos
- [ ] Hay un botón "Guardar" que envía los datos al backend
- [ ] Hay un botón "Cancelar" que vuelve al listado sin guardar
- [ ] Mientras se envía la petición, el botón "Guardar" muestra un indicador de carga y está deshabilitado
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El formulario muestra errores de validación cuando se intenta guardar con campos vacíos
- [ ] El campo año rechaza valores no numéricos o menores a 1900
- [ ] Los campos de precio rechazan valores negativos
- [ ] El botón "Guardar" está deshabilitado mientras hay errores de validación
- [ ] Los selectores de marca, categoría y tipo se populan correctamente con datos del backend

### Pruebas de integración

- [ ] Al hacer clic en "Guardar" con datos válidos, se envía POST /operations con el payload correcto
- [ ] Si el backend devuelve 201 Created, se muestra un mensaje de éxito y se redirige al listado
- [ ] Si el backend devuelve error, se muestra el mensaje de error sin redirigir
- [ ] Al hacer clic en "Cancelar", se vuelve al listado sin hacer petición al backend
