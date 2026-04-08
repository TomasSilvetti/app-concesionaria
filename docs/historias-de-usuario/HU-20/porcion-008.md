# porcion-008 — Modal de detalle de tarjeta [FRONT]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-006, porcion-007
**Estado:** completada

## Descripción

Crear el modal que se abre al hacer clic sobre una tarjeta en el tablero. Muestra el título, el cuerpo con los ítems de checklist renderizados e interactuables (se pueden tildar/destildar), el nombre del usuario creador, y botones para editar (abre el formulario de la porcion-006) y eliminar (con diálogo de confirmación).

## Ejemplo de uso

El usuario hace clic sobre la tarjeta "Honda Civic para Pedro". Se abre un modal con el título, el cuerpo donde se ve `☐ Revisar precio` y `☐ Contactar vendedor` como ítems de checklist clickeables, y el texto "Creado por: María". Al tildar "Revisar precio", el ítem se actualiza en tiempo real y se persiste. Al hacer clic en "Eliminar" aparece una confirmación; si acepta, la tarjeta desaparece del tablero y el modal se cierra.

## Criterios de aceptación

- [ ] El modal muestra: título, cuerpo con checklists renderizados, nombre del usuario creador
- [ ] Los ítems de checklist (`- [ ]` / `- [x]`) se renderizan como checkboxes interactuables; al tildar/destildar se actualiza el cuerpo y se persiste via API
- [ ] Existe un botón "Editar" que abre el formulario de edición (porcion-006) pre-cargado con los datos actuales
- [ ] Existe un botón "Eliminar" que muestra un diálogo de confirmación antes de borrar
- [ ] Si el usuario confirma la eliminación, la tarjeta se elimina, el modal se cierra y la tarjeta desaparece del tablero
- [ ] El modal se puede cerrar con un botón de cerrar o haciendo clic fuera
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El cuerpo con texto `- [ ] Tarea` se renderiza como un checkbox desmarcado con label "Tarea"
- [ ] El cuerpo con texto `- [x] Tarea hecha` se renderiza como un checkbox marcado
- [ ] Al hacer clic en un checkbox, el estado local se actualiza de inmediato (optimistic update)
- [ ] El botón "Eliminar" no elimina directamente; abre un diálogo de confirmación

### Pruebas de integración

- [ ] Al tildar un checkbox, se llama a `PATCH /api/kanban/tarjetas/:id` con el cuerpo actualizado
- [ ] Al confirmar la eliminación, se llama a `DELETE /api/kanban/tarjetas/:id` y al completarse el modal se cierra y la tarjeta ya no aparece en el tablero
- [ ] Si la API de eliminación falla, el modal permanece abierto y se muestra un mensaje de error
- [ ] Al hacer clic en "Editar", se abre el formulario de edición con título y cuerpo pre-cargados correctamente
