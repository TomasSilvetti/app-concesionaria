# porcion-006 — Formulario completo de operaciones — vista [FRONT]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-007
**Tipo:** FRONT
**Prerequisitos:** porcion-002, porcion-009
**Estado:** 🔄 En progreso

## Descripción

Crear el formulario completo de registro de operaciones que incluya todos los campos del vehículo (reutilizando el componente `VehicleFieldsForm` de porcion-002) más los campos específicos de la operación: tipo de operación, fecha de inicio, precio de venta total, ingresos brutos, comisión y estado. El formulario debe usar exactamente el mismo componente que usa el módulo de stock para garantizar que ambos capturen los mismos datos del vehículo.

## Ejemplo de uso

El vendedor hace clic en "Nueva operación", ve un formulario con dos secciones: una con todos los datos del vehículo (usando el componente `VehicleFieldsForm` que incluye marca, modelo, año, patente, categoría, versión, color, kilómetros, notas mecánicas, notas generales, precio revista, precio oferta y fotos) y otra con los datos específicos de la operación (tipo, fecha de inicio, precio de venta total, ingresos brutos, comisión). Completa ambas secciones y guarda la operación.

## Criterios de aceptación

- [ ] El formulario incluye el componente `VehicleFieldsForm` (porcion-002) con todos sus campos: marca, modelo, año, patente, categoría, versión, color, kilómetros, notas mecánicas, notas generales, precio revista, precio oferta y fotos
- [ ] El formulario incluye el selector de tipo de operación (porcion-004)
- [ ] El formulario incluye los campos específicos de operación: fecha de inicio, precio de venta total, ingresos brutos, comisión
- [ ] Todos los campos obligatorios están marcados con asterisco rojo (tanto los del vehículo como los de la operación)
- [ ] El botón "Guardar Operación" está deshabilitado si faltan campos obligatorios del vehículo o de la operación
- [ ] El formulario muestra mensajes de error específicos para cada campo inválido
- [ ] El formulario muestra un mensaje de éxito cuando la operación se guarda correctamente
- [ ] El formulario tiene botones "Cancelar" y "Guardar Operación"
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop
- [ ] El formulario captura exactamente los mismos campos del vehículo que el formulario de stock

## Pruebas

### Pruebas unitarias

- [ ] El formulario renderiza correctamente todos los campos de vehículo y operación
- [ ] El botón "Guardar Operación" se deshabilita cuando faltan campos obligatorios
- [ ] El botón "Guardar Operación" se habilita cuando todos los campos obligatorios están completos
- [ ] Los mensajes de error se muestran cuando los campos tienen valores inválidos
- [ ] El botón "Cancelar" llama al handler `onCancel` cuando se hace clic
- [ ] El formulario muestra el estado de carga mientras se envía la operación

### Pruebas de integración

- [ ] Al enviar el formulario completo, se construye correctamente el payload con todos los datos del vehículo (incluyendo version, color, kilometros, notas, precios y fotos) y la operación
- [ ] El payload incluye todos los campos que acepta el componente `VehicleFieldsForm`
- [ ] Si el backend devuelve error 400, el formulario muestra el mensaje de error correspondiente
- [ ] Si el backend devuelve éxito (201), el formulario muestra el mensaje de éxito y llama al handler `onSuccess`
- [ ] Al hacer clic en "Cancelar", el formulario se cierra sin guardar cambios
- [ ] Los campos del vehículo en el formulario de operaciones se comportan exactamente igual que en el formulario de stock
