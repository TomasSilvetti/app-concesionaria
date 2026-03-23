# porcion-004 — Bloquear edición y flujo de reapertura en vista edit [FRONT]

**Historia de usuario:** HU-10: Cierre y Reapertura de Operaciones con Validación de Pagos
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-001

## Descripción

Cuando una operación tiene estado `cerrada`:

1. En la vista de detalle, al hacer clic en "Editar" aparece un modal de advertencia: *"¿Deseás reabrir la operación?"*. Si confirma, el sistema llama al endpoint que cambia el estado a `abierta` y navega al modo edición. Si cancela, no ocurre nada.
2. En la vista de edición (`operaciones/[id]/edit`), si la operación llega con estado `cerrada`, todos los campos del formulario están deshabilitados y se muestra un banner de advertencia. La sección de gastos (`OperationExpensesSection`) permanece habilitada.

## Ejemplo de uso

- Empleado en el detalle de una operación cerrada → hace clic en "Editar" → aparece modal *"¿Deseás reabrir la operación?"* → confirma → estado cambia a `abierta` → accede a la vista de edición con todos los campos habilitados.
- Empleado accede directamente a `/operaciones/[id]/edit` de una operación cerrada → ve un banner: *"Esta operación está cerrada. Para editarla, primero debés reabrirla."* → campos deshabilitados → puede seguir cargando gastos normalmente.

## Criterios de aceptación

- [ ] En la vista de detalle, el botón "Editar" de una operación cerrada abre un modal de confirmación: *"¿Deseás reabrir la operación?"* con botones "Confirmar" y "Cancelar"
- [ ] Si confirma → se llama al endpoint que actualiza el estado a `abierta` → navega a la vista de edición
- [ ] Si cancela → el modal se cierra sin cambios
- [ ] En la vista de edición con operación cerrada, todos los campos del formulario están deshabilitados (`disabled`)
- [ ] Se muestra un banner de advertencia visible con el mensaje: *"Esta operación está cerrada. Para editarla, primero debés reabrirla."*
- [ ] `OperationExpensesSection` permanece habilitada independientemente del estado

## Notas técnicas

⚠️ **API de reapertura:** Esta porción requiere un endpoint para cambiar el estado de `cerrada` a `abierta`. Puede implementarse como `PATCH /api/operations/[id]` con `{ estado: "abierta" }` (si ya existe) o como un endpoint dedicado `POST /api/operations/[id]/reabrir`.

## Pruebas

### Pruebas manuales

- [ ] Operación cerrada en detalle → clic "Editar" → modal aparece → cancelar → sin cambios
- [ ] Operación cerrada en detalle → clic "Editar" → confirmar → estado cambia a `abierta` → vista de edición con campos habilitados
- [ ] Acceder directamente a `/operaciones/[id]/edit` con operación cerrada → banner visible, campos deshabilitados, gastos habilitados
