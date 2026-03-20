# porcion-007 — Endpoint registrar pago + cierre automático de operación [BACK]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-006
**Estado:** ✅ Completada
**Completada el:** 2026-03-19

## Descripción

Crear el endpoint para registrar un nuevo pago (`Pago`) contra una operación. Después de persistir el pago, calcula el `pendiente` actualizado (`precioVentaTotal - SUM(pagos)`); si queda en 0, cambia automáticamente el `estado` de la operación a `closed`.

## Ejemplo de uso

El frontend hace `POST /api/operations/:id/pagos` con `{ "fecha": "2026-03-19", "metodoPagoId": "mp-1", "monto": 150000, "nota": "Pago final" }`. El backend persiste el pago, recalcula el pendiente y, si es 0, actualiza la operación a `estado: "closed"`. Responde con el pago creado más los valores actualizados de `saldado` y `pendiente`.

## Criterios de aceptación

- [ ] `POST /api/operations/:id/pagos` crea un registro `Pago` asociado a la operación
- [ ] La respuesta incluye el pago creado y los valores calculados `saldado` y `pendiente`
- [ ] Si tras el pago el `pendiente` es 0, el `estado` de la operación cambia a `closed` en la misma transacción
- [ ] El endpoint valida que `monto > 0`; devuelve 400 si no
- [ ] El endpoint valida que `metodoPagoId` existe y pertenece al mismo `clienteId`; devuelve 400 si no
- [ ] El endpoint valida que la operación existe y pertenece al `clienteId` autenticado; devuelve 404 si no
- [ ] El `clienteId` del pago se toma del usuario autenticado, no del body

## Pruebas

### Pruebas unitarias

- [ ] La función de cálculo de `pendiente` devuelve `precioVentaTotal - SUM(pagos)` correctamente
- [ ] Si `pendiente` calculado es 0, el servicio actualiza `estado` a `closed`
- [ ] Si `pendiente` calculado es mayor a 0, el `estado` no cambia
- [ ] El validador rechaza `monto <= 0` con error 400
- [ ] El validador rechaza body sin `metodoPagoId` con error 400

### Pruebas de integración

- [ ] `POST /api/operations/:id/pagos` con datos válidos persiste el pago y retorna `saldado` y `pendiente` correctos
- [ ] Al registrar un pago que lleva el pendiente a 0, la operación queda con `estado: "closed"` en BD
- [ ] Al registrar un pago parcial (pendiente > 0 aún), la operación mantiene `estado: "open"`
- [ ] `POST /api/operations/:id/pagos` con `monto: 0` retorna 400
- [ ] `POST /api/operations/inexistente/pagos` retorna 404
