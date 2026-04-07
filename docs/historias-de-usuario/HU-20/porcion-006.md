# porcion-006 — Formulario crear/editar tarjeta con soporte checklist [FRONT]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-007
**Tipo:** FRONT
**Estado:** completada
**Prerequisitos:** porcion-002

## Descripción

Crear el formulario (modal o panel) para agregar una tarjeta nueva o editar una existente. Incluye campos de título y cuerpo de texto, con un botón o atajo de teclado para insertar un ítem de checklist (`- [ ] `) en la posición del cursor dentro del cuerpo.

## Ejemplo de uso

El usuario hace clic en "+ Agregar" en la columna "Buscando". Se abre un modal con un campo de título y un área de texto para el cuerpo. El usuario escribe el título "Honda Civic para Pedro", luego presiona el botón de checklist y se inserta `- [ ] ` en el cuerpo. Guarda y la tarjeta aparece en la columna.

## Criterios de aceptación

- [ ] El formulario tiene un campo de título (requerido) y un área de texto para el cuerpo (opcional)
- [ ] El botón "Guardar" está deshabilitado si el título está vacío
- [ ] Existe un botón o atajo que inserta `- [ ] ` en la posición actual del cursor dentro del área de cuerpo
- [ ] Al editar una tarjeta existente, el formulario se pre-carga con el título y cuerpo actuales
- [ ] Al guardar correctamente, el modal se cierra y la tarjeta aparece/actualiza en el tablero sin recargar la página
- [ ] Se muestra un indicador de carga mientras se procesa el guardado
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón "Guardar" está deshabilitado cuando el campo título está vacío o contiene solo espacios
- [ ] Al hacer clic en el botón de checklist, se inserta `- [ ] ` en la posición del cursor (o al final si no hay foco)
- [ ] Al recibir props de una tarjeta existente, el formulario inicializa los campos con los valores correctos

### Pruebas de integración

- [ ] Al guardar un formulario nuevo, se llama al endpoint `POST /api/kanban/tarjetas` con el título, cuerpo y columnaId correctos
- [ ] Al guardar en modo edición, se llama al endpoint `PATCH /api/kanban/tarjetas/:id` con los campos modificados
- [ ] Si la API devuelve error, se muestra un mensaje de error y el modal permanece abierto
