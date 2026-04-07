# porcion-004 — Drag & drop de tarjetas entre columnas y reordenamiento de columnas [FRONT]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-005
**Tipo:** FRONT
**Estado:** completada
**Prerequisitos:** porcion-002

## Descripción

Agregar la funcionalidad de arrastrar y soltar al tablero: las tarjetas pueden moverse entre columnas y dentro de la misma columna, y las columnas pueden reordenarse entre sí. Al soltar un elemento, el estado visual se actualiza de inmediato y se dispara la llamada a la API para persistir el cambio.

## Ejemplo de uso

El usuario agarra la tarjeta "Toyota Corolla para Juan" de la columna "Buscando" y la arrastra a la columna "En negociación". Al soltar, la tarjeta aparece en la nueva columna. Si la API falla, la tarjeta vuelve a su posición original y se muestra un mensaje de error.

## Criterios de aceptación

- [ ] Las tarjetas se pueden arrastrar y soltar entre columnas distintas
- [ ] Las tarjetas se pueden reordenar dentro de la misma columna
- [ ] Las columnas se pueden reordenar arrastrándolas por el encabezado
- [ ] El tablero refleja el nuevo orden visualmente de forma inmediata al soltar (optimistic update)
- [ ] Si la API devuelve error al persistir, el tablero revierte al estado anterior y muestra un mensaje
- [ ] Durante el arrastre se muestra una indicación visual clara del elemento que se está moviendo y del destino
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al mover una tarjeta a otra columna, el estado local se actualiza correctamente (la tarjeta aparece en la columna destino y desaparece de la origen)
- [ ] Al reordenar columnas, el array de columnas en el estado refleja el nuevo orden
- [ ] Si la llamada a la API de persistencia falla, el estado revierte al snapshot anterior al arrastre

### Pruebas de integración

- [ ] Al soltar una tarjeta en otra columna, se llama al endpoint de mover tarjeta con el `columnaId` destino y el nuevo `orden` correctos
- [ ] Al reordenar columnas, se llama al endpoint de reordenamiento con el array actualizado de `{ id, orden }`
