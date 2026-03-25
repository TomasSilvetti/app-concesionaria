# porcion-004 — Suite de integración: Pagos [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `pagos.integration.test.ts` con los tests de integración para las API routes de pagos de una operación: registro de un pago nuevo, validación de monto negativo, y listado de pagos de una operación.

## Ejemplo de uso

La suite siembra una operación con saldo pendiente, registra un pago vía POST y verifica que el campo `saldoPendiente` de la operación se haya actualizado correctamente en la BD.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/pagos.integration.test.ts`
- [ ] El `beforeEach` limpia `Pago`, `Operation` y las tablas dependientes, y resiembra una operación con un método de pago asociado
- [ ] POST `/api/operations/[id]/pagos` con datos válidos devuelve 201 y actualiza el saldo pendiente de la operación en BD
- [ ] POST `/api/operations/[id]/pagos` con `monto` negativo devuelve 400 y no crea ningún registro en BD
- [ ] GET `/api/operations/[id]/pagos` devuelve solo los pagos de esa operación (no los de otras operaciones)

## Pruebas

### Pruebas unitarias

- [ ] El test de monto negativo verifica que la validación ocurre antes de cualquier escritura en BD (el conteo de `Pago` no cambia)
- [ ] Los datos del body de respuesta del POST exitoso incluyen al menos `id`, `monto`, `operacionId` y `fecha`

### Pruebas de integración

- [ ] POST pago válido → `db.pago.findMany({ where: { operacionId } })` devuelve 1 registro con el monto correcto
- [ ] POST pago válido → el campo calculado de saldo en la operación refleja el descuento del pago registrado
- [ ] POST pago con `monto: -500` → `db.pago.count()` sigue siendo 0 después del request
- [ ] GET pagos de operación A no devuelve pagos de la operación B (sembradas ambas con pagos distintos)
- [ ] POST a una operación que no pertenece al cliente autenticado devuelve 403 o 404
