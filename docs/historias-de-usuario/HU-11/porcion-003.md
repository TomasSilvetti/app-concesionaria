# porcion-003 — Vista de detalle en modo solo lectura [FRONT]

**Historia de usuario:** HU-11: Layout unificado y modo lectura en el detalle de operación
**Par:** —
**Tipo:** FRONT
**Estado:** ⬜ Pendiente
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Pasar `readOnly={true}` a `OperationExpensesSection` y `OperationCobranzasSection` en la vista de detalle de la operación (`/operaciones/[id]/page.tsx`). Con esto, la vista de detalle pasa a ser completamente de solo lectura: no se pueden agregar pagos ni gastos desde ahí.

## Archivos a modificar

- `src/app/operaciones/[id]/page.tsx`

## Cambios esperados

1. En `<OperationExpensesSection ... />` (línea ~428): agregar `readOnly={true}`.
2. En `<OperationCobranzasSection ... />` (línea ~465): agregar `readOnly={true}`.

## Criterios de aceptación

- [ ] En la vista de detalle, el botón "Agregar" del módulo de gastos no es visible
- [ ] En la vista de detalle, el botón "Agregar pago" de cobranzas no es visible
- [ ] La tabla de gastos, tabla de pagos y todos los datos siguen siendo visibles
- [ ] El botón "Editar" del header sigue funcionando correctamente para acceder al modo edición

## Pruebas

### Pruebas manuales

- [ ] Acceder al detalle de cualquier operación → confirmar que no hay botones "Agregar" ni "Agregar pago"
- [ ] Confirmar que los datos de gastos y pagos siguen viéndose correctamente
- [ ] Hacer clic en "Editar" → confirmar que redirige al modo edición normalmente
