# porcion-009 — Botón "$" en tabla de operaciones [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-006, porcion-007
**Estado:** ✅ Completada
**Completada el:** 2026-03-19

## Descripción

Agregar un botón con ícono "$" en cada fila de la tabla de operaciones, ubicado junto al botón de editar. Al hacer clic, abre el modal de carga de pago (porcion-006) para esa operación, con el `pendiente` correspondiente.

## Ejemplo de uso

En la tabla de operaciones, cada fila muestra sus botones de acción: `[Editar] [$]`. El usuario hace clic en "$" de la operación "OP-003". Se abre el modal de carga de pago con el pendiente de esa operación pre-cargado. El flujo de guardado es idéntico al del documento de operación.

## Criterios de aceptación

- [ ] Cada fila de la tabla de operaciones muestra un botón con ícono "$" junto al botón editar
- [ ] Al hacer clic en "$", se abre el modal de carga de pago (porcion-006) con el `operacionId` y `pendiente` correctos
- [ ] Al guardar un pago desde este modal, el flujo es idéntico al del documento de operación (llama al mismo endpoint)
- [ ] El botón es visualmente consistente con el estilo del botón editar existente
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón "$" renderiza en cada fila de la tabla
- [ ] Al hacer clic en "$" de una fila, el modal se abre con el `operacionId` correcto de esa fila
- [ ] El `pendiente` pasado al modal coincide con el `precioVentaTotal - saldado` de la operación correspondiente

### Pruebas de integración

- [ ] Al guardar un pago desde el modal abierto con "$", el sistema llama al endpoint correcto `POST /api/operations/:id/pagos`
- [ ] Tras guardar el pago, el modal se cierra y la tabla puede refrescarse para reflejar el nuevo estado
