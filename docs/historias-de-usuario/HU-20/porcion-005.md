# porcion-005 — Endpoints para persistir reordenamiento de tarjetas y columnas [BACK]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-004
**Tipo:** BACK
**Estado:** completada
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints que reciben y persisten los cambios de posición del drag & drop: mover una tarjeta a otra columna (o dentro de la misma), y reordenar columnas. Ambas operaciones actualizan el campo `orden` de los registros afectados en la base de datos.

## Ejemplo de uso

El frontend envía `PATCH /api/kanban/tarjetas/:id/mover` con `{ columnaId: "col-2", orden: 1 }` y el backend actualiza la tarjeta y reordena las demás tarjetas de la columna destino. Para columnas envía `PATCH /api/kanban/columnas/reordenar` con `[{ id: "col-1", orden: 0 }, { id: "col-2", orden: 1 }]`.

## Criterios de aceptación

- [ ] `PATCH /api/kanban/tarjetas/:id/mover` actualiza el `columnaId` y el `orden` de la tarjeta y reordena las demás tarjetas de la columna destino
- [ ] `PATCH /api/kanban/columnas/reordenar` recibe un array de `{ id, orden }` y actualiza el `orden` de cada columna en una transacción
- [ ] Ambos endpoints validan que todos los elementos pertenezcan al cliente autenticado
- [ ] Las operaciones de reordenamiento se ejecutan en una transacción para evitar estados inconsistentes
- [ ] Si algún id del array no pertenece al cliente, se rechaza toda la operación con 403

## Pruebas

### Pruebas unitarias

- [ ] El servicio de mover tarjeta actualiza correctamente `columnaId` y `orden` de la tarjeta destino
- [ ] El servicio de reordenar columnas aplica todos los cambios de orden o ninguno (transacción atómica)
- [ ] Enviar un `columnaId` que no pertenece al cliente lanza error de autorización

### Pruebas de integración

- [ ] Después de llamar a mover tarjeta, consultar la BD confirma que la tarjeta está en la nueva columna con el orden correcto
- [ ] Después de reordenar columnas, consultar la BD confirma que todas las columnas tienen el `orden` actualizado
- [ ] Enviar un array con ids mezclados de distintos clientes devuelve 403 y no modifica ningún registro
