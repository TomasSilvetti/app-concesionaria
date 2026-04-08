# porcion-001 — Migración BD: modelos KanbanColumna y KanbanTarjeta [BACK]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** —
**Tipo:** BACK
**Estado:** completada
**Prerequisitos:** Ninguno

## Descripción

Crear en la base de datos las dos tablas nuevas que soportan el tablero kanban: `KanbanColumna` (columnas del tablero) y `KanbanTarjeta` (tarjetas dentro de cada columna), ambas asociadas a un cliente y con soporte para orden personalizado.

## Ejemplo de uso

Después de correr la migración, la base de datos tiene las tablas `KanbanColumna` y `KanbanTarjeta`. Un registro de columna podría ser `{ id, clienteId, nombre: "Buscando", orden: 0 }` y una tarjeta `{ id, clienteId, columnaId, titulo: "Toyota Corolla para Juan", cuerpo: "- [ ] Revisar precio\n- [ ] Contactar vendedor", orden: 0, creadoPorNombre: "María" }`.

## Criterios de aceptación

- [ ] Existe el modelo `KanbanColumna` con campos: `id`, `clienteId`, `nombre`, `orden` (Int), `creadoEn`
- [ ] Existe el modelo `KanbanTarjeta` con campos: `id`, `clienteId`, `columnaId`, `titulo`, `cuerpo` (texto largo, nullable), `orden` (Int), `creadoPorId`, `creadoPorNombre`, `creadoEn`, `actualizadoEn`
- [ ] `KanbanTarjeta` tiene relación con `KanbanColumna` (onDelete: Cascade)
- [ ] Ambos modelos tienen relación con `Client` (onDelete: Cascade)
- [ ] La migración se aplica sin errores en la base de datos

## Pruebas

### Pruebas unitarias

- [ ] El modelo `KanbanColumna` acepta crear un registro con todos los campos requeridos y lo persiste correctamente
- [ ] El modelo `KanbanTarjeta` acepta crear un registro con cuerpo vacío (null) sin error
- [ ] Crear una tarjeta con `columnaId` inexistente lanza error de constraint de clave foránea

### Pruebas de integración

- [ ] Al eliminar un `Client`, se eliminan en cascada sus `KanbanColumna` y `KanbanTarjeta`
- [ ] Al eliminar una `KanbanColumna`, se eliminan en cascada todas sus `KanbanTarjeta`
- [ ] Se pueden insertar múltiples tarjetas en la misma columna con distintos valores de `orden`
