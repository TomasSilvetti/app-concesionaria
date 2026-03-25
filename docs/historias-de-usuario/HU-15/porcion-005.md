# porcion-005 — Suite de integración: Gastos asociados [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Crear el archivo `expenses.integration.test.ts` con los tests de integración para las API routes de gastos asociados a una operación: agregar un gasto (y verificar que recalcula `gastosAsociados` e `ingresosNetos` en la operación) y eliminar un gasto (y verificar que revierte el recálculo).

## Ejemplo de uso

La suite siembra una operación, le agrega un gasto vía POST y verifica que `gastosAsociados` de la operación subió en la BD. Luego elimina ese gasto con DELETE y verifica que `gastosAsociados` volvió al valor original.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/expenses.integration.test.ts`
- [ ] El `beforeEach` limpia `Expense`, `Operation`, `Category`, `Origin` y tablas dependientes, y resiembra con una operación + categoría + origen válidos
- [ ] POST `/api/operations/[id]/expenses` agrega el gasto y en BD el campo `gastosAsociados` de la operación aumenta con el monto del gasto
- [ ] POST `/api/operations/[id]/expenses` también recalcula `ingresosNetos` de la operación (baja en el mismo monto que subió `gastosAsociados`)
- [ ] DELETE `/api/operations/[id]/expenses/[gastoId]` elimina el registro `Expense` y revierte `gastosAsociados` e `ingresosNetos` a sus valores previos
- [ ] DELETE de un `gastoId` que no pertenece al cliente autenticado devuelve 403 o 404

## Pruebas

### Pruebas unitarias

- [ ] Los valores esperados de `gastosAsociados` e `ingresosNetos` post-gasto se calculan correctamente según la fórmula del negocio
- [ ] Los valores después del DELETE vuelven exactamente a los valores previos al POST (sin drift por floating point significativo)

### Pruebas de integración

- [ ] POST gasto → `db.operation.findUnique` muestra `gastosAsociados` incrementado en `monto` del gasto
- [ ] POST gasto → `ingresosNetos` de la operación disminuye en el mismo monto
- [ ] DELETE gasto → `db.expense.findUnique({ where: { id: gastoId } })` devuelve `null`
- [ ] DELETE gasto → `gastosAsociados` e `ingresosNetos` de la operación vuelven a los valores previos al gasto
- [ ] POST gasto con `categoriaId` inexistente devuelve 400 o 404 y no modifica la operación
