# porcion-008 — Validación de vehículo usado en toma de pago [FRONT+BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** —
**Tipo:** FRONT+BACK
**Prerequisitos:** porcion-005, porcion-007, porcion-010, porcion-011

## Descripción

Implementar la validación que impide guardar una operación de tipo "Venta con toma de usado" si no se ha añadido el vehículo usado que se toma como parte de pago (usando el formulario secundario de porcion-010). La validación debe funcionar tanto en el frontend (feedback inmediato) como en el backend (seguridad).

## Ejemplo de uso

El vendedor selecciona el tipo de operación "Venta con toma de usado", completa los datos del vehículo a vender, e intenta guardar sin haber añadido el vehículo usado en el formulario secundario. El sistema muestra inmediatamente el mensaje "Debés añadir el vehículo usado antes de guardar esta operación" y no permite enviar el formulario. Si el vendedor intenta bypassear la validación frontend, el backend rechaza la operación con el mismo mensaje (validación de porcion-011).

## Criterios de aceptación

- [ ] Cuando el tipo de operación es "Venta con toma de usado", el formulario valida que exista al menos un vehículo usado añadido
- [ ] Si no hay vehículo usado añadido, se muestra el mensaje: "Debés añadir el vehículo usado antes de guardar esta operación"
- [ ] El mensaje de error se muestra de forma prominente cerca del selector de tipo de operación o en la zona de vehículos usados
- [ ] El botón "Guardar Operación" permanece deshabilitado mientras falte el vehículo usado
- [ ] El backend valida la misma condición y rechaza la operación con código 400 si no se cumple
- [ ] Para los otros tipos de operación, no se requiere vehículo usado y la validación no aplica
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias (Frontend)

- [ ] La validación detecta correctamente cuando el tipo es "Venta con toma de usado" y no hay vehículo usado
- [ ] La validación permite guardar cuando el tipo es "Venta con toma de usado" y hay al menos un vehículo usado
- [ ] La validación no aplica cuando el tipo de operación es diferente a "Venta con toma de usado"
- [ ] El mensaje de error se muestra en el lugar correcto del formulario

### Pruebas unitarias (Backend)

- [ ] La función de validación detecta operaciones de tipo "Venta con toma de usado" sin vehículo usado
- [ ] La función de validación permite operaciones de tipo "Venta con toma de usado" con vehículo usado
- [ ] La función de validación no aplica restricción para otros tipos de operación

### Pruebas de integración

- [ ] Al intentar crear una operación "Venta con toma de usado" sin vehículo usado desde el frontend, el botón permanece deshabilitado
- [ ] Al intentar crear una operación "Venta con toma de usado" sin vehículo usado mediante llamada directa al backend, se devuelve 400
- [ ] Al crear una operación "Venta con toma de usado" con vehículo usado añadido, la operación se guarda exitosamente
- [ ] Al crear operaciones de otros tipos sin vehículo usado, se guardan exitosamente sin validación adicional
