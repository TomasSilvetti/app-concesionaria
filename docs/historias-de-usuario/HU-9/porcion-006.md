# porcion-006 — Botón "Generar documento" + modal de selección de plantilla [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-003

## Descripción

Agregar el botón "Generar documento" al detalle de una operación, ubicado a la izquierda del botón "Editar". Al hacer clic se abre un modal con la lista de plantillas disponibles para seleccionar. Incluye el estado vacío cuando no hay plantillas configuradas. Al seleccionar una plantilla, el modal se cierra y dispara la apertura de la vista previa/editor (porcion-007).

## Ejemplo de uso

El vendedor abre el detalle de la operación de venta de un Toyota Corolla. Ve el botón "Generar documento" a la izquierda de "Editar". Lo presiona y se abre un modal con las plantillas disponibles: "Contrato de compraventa", "Formulario de transferencia". Hace clic en "Contrato de compraventa" y el modal se cierra dando paso al editor.

## Criterios de aceptación

- [ ] El botón "Generar documento" aparece en el encabezado del detalle de la operación, a la izquierda del botón "Editar"
- [ ] Al hacer clic en el botón, se abre el modal de selección de plantilla
- [ ] El modal muestra la lista de plantillas disponibles con nombre y tipo (PDF/DOCX)
- [ ] Cada ítem de la lista es seleccionable con un clic; al seleccionar se cierra el modal y se continúa al siguiente paso
- [ ] Si no hay plantillas configuradas, el modal muestra el mensaje: "No hay documentos disponibles. Configurá uno desde la página de Documentos." con un enlace directo a `/documentos`
- [ ] El modal se puede cerrar sin seleccionar ninguna plantilla (botón de cerrar o clic fuera del modal)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Cuando la lista de plantillas está vacía, el modal renderiza el estado vacío con el mensaje y el enlace correctos
- [ ] Cuando hay plantillas, se renderiza una fila por plantilla con nombre y tipo
- [ ] Al hacer clic en una plantilla, se invoca el callback `onSelect` con el id de la plantilla seleccionada
- [ ] Al hacer clic fuera del modal o en el botón de cerrar, el modal se cierra sin invocar `onSelect`

### Pruebas de integración

- [ ] Al abrir el modal, se llama al servicio de listado de plantillas (`GET /api/documentos/plantillas`)
- [ ] Si la llamada al servicio falla, el modal muestra un mensaje de error en lugar de la lista
- [ ] Al seleccionar una plantilla, el modal se desmonta y se renderiza la vista previa/editor con el id de plantilla correcto
