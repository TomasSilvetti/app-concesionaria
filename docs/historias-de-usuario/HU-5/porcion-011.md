# porcion-011 — Guardar vehículo usado en toma de pago — lógica [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-010
**Tipo:** BACK
**Prerequisitos:** porcion-007, HU-6 (refactorización del modelo de vehículos)
**Estado:** ✅ Completada
**Completada el:** 15/03/2026

## Descripción

Modificar el endpoint de creación de operaciones para que, cuando el tipo de operación es "Venta con toma de usado", guarde también el vehículo usado en la tabla `Vehicle` con `estado = "disponible"` y cree la relación correspondiente en `OperationExchange` para vincular el vehículo usado con la operación.

## Ejemplo de uso

El frontend envía un `POST /api/operations` con los datos de la operación (incluyendo el vehículo a vender) y los datos del vehículo usado tomado como parte de pago. El backend:
1. Crea el vehículo que se vende en `Vehicle` con `estado = "en_proceso"`
2. Crea el registro de `Operation` con `vehiculoVendidoId` apuntando al vehículo creado
3. Crea el vehículo usado en `Vehicle` con `estado = "disponible"` (para que aparezca en stock)
4. Crea un registro en `OperationExchange` vinculando el vehículo usado con la operación
5. Responde con código 201 y los datos completos de la operación creada

## Criterios de aceptación

- [ ] El endpoint `POST /api/operations` acepta un objeto opcional `vehiculoUsado` en el body
- [ ] Cuando el tipo de operación es "Venta con toma de usado" y se envía `vehiculoUsado`, el backend crea un registro en `Vehicle` con esos datos y `estado = "disponible"`
- [ ] El vehículo usado creado se asocia al mismo `clienteId` de la operación
- [ ] El vehículo usado NO tiene `operacionId` (no está vinculado directamente a la operación)
- [ ] Se crea un registro en `OperationExchange` vinculando el ID del vehículo usado con el `operacionId`
- [ ] El campo `precioNegociado` en `OperationExchange` se guarda si se envía desde el frontend
- [ ] Si el tipo de operación es "Venta con toma de usado" pero no se envía `vehiculoUsado`, el backend devuelve 400 con el mensaje "Debés añadir el vehículo usado antes de guardar esta operación"
- [ ] Para otros tipos de operación, el campo `vehiculoUsado` se ignora si se envía
- [ ] La operación completa (Vehicle vendido + Operation + Vehicle usado + OperationExchange) se guarda en una transacción para garantizar consistencia
- [ ] El vehículo usado con `estado = "disponible"` aparece en el listado de stock disponible

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta cuando el tipo es "Venta con toma de usado" y falta `vehiculoUsado`
- [ ] La función de validación permite operaciones de tipo "Venta con toma de usado" cuando se envía `vehiculoUsado` válido
- [ ] La función de validación no requiere `vehiculoUsado` para otros tipos de operación
- [ ] La función de creación de Vehicle valida correctamente los campos obligatorios del vehículo usado
- [ ] La función de creación de Vehicle asigna correctamente `estado = "disponible"` al vehículo usado
- [ ] La función de creación de OperationExchange vincula correctamente el vehículo usado con la operación

### Pruebas de integración

- [ ] `POST /api/operations` con tipo "Venta con toma de usado" y `vehiculoUsado` válido crea Vehicle (vendido), Operation, Vehicle (usado) y OperationExchange correctamente
- [ ] `POST /api/operations` con tipo "Venta con toma de usado" sin `vehiculoUsado` devuelve 400 con mensaje de error
- [ ] `POST /api/operations` con otros tipos de operación y sin `vehiculoUsado` se guarda exitosamente
- [ ] Si falla la creación del vehículo usado, toda la transacción se revierte (rollback)
- [ ] El vehículo usado creado tiene `estado = "disponible"` y NO tiene `operacionId`
- [ ] El vehículo usado con `estado = "disponible"` aparece en el listado de stock disponible (`GET /api/stock`)
- [ ] El registro de OperationExchange tiene el ID correcto del vehículo usado
- [ ] Al consultar la operación creada con `include: { OperationExchange: { include: { Vehicle: true } } }`, se obtienen los datos del vehículo usado
