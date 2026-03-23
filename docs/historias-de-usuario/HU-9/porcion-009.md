# porcion-009 — Sección "Documentos generados" en el detalle de operación [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-010
**Tipo:** FRONT
**Prerequisitos:** porcion-007

## Descripción

Agregar al pie del detalle de una operación la sección "Documentos generados", que lista todos los documentos ya generados para esa operación. Cada documento muestra su nombre, fecha de creación y tres acciones: descargar, editar (vuelve a abrir el editor con los valores actuales) y borrar. Incluye diálogo de confirmación al borrar. En esta porción los datos son mockeados; la conexión real se hace en porcion-010.

## Ejemplo de uso

Al final del detalle de la operación de venta del Toyota Corolla aparece la sección "Documentos generados" con dos filas: "Contrato de compraventa — 21/03/2026" y "Formulario de transferencia — 21/03/2026". Cada fila tiene los íconos de descarga, edición y borrado. Al hacer clic en borrar, aparece el diálogo "¿Estás seguro? Esta acción no se puede deshacer."

## Criterios de aceptación

- [ ] La sección "Documentos generados" aparece al pie del detalle de la operación
- [ ] Si no hay documentos generados para esa operación, la sección muestra el mensaje "Sin documentos generados aún"
- [ ] Cada documento generado muestra: nombre del archivo, nombre de la plantilla usada y fecha de creación
- [ ] Cada documento tiene botón de descarga, que inicia la descarga del archivo en el navegador
- [ ] Cada documento tiene botón de edición, que reabre la vista previa/editor (porcion-007) con los valores anteriores para poder modificar y regenerar
- [ ] Cada documento tiene botón de borrado, que abre un diálogo de confirmación antes de eliminar
- [ ] Al confirmar el borrado, el documento desaparece de la lista sin necesidad de recargar la página
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Cuando la lista de documentos está vacía, se renderiza el mensaje "Sin documentos generados aún"
- [ ] Cuando hay documentos, se renderiza una fila por cada documento con nombre, plantilla, fecha y los tres botones de acción
- [ ] El botón de borrado abre el diálogo de confirmación y no ejecuta la eliminación de forma directa
- [ ] Al confirmar el borrado en el diálogo, se invoca el callback `onDelete` con el `id` del documento correcto
- [ ] El botón de descarga genera un enlace con `href` al endpoint de descarga y dispara la descarga

### Pruebas de integración

- [ ] Al montar la sección, se llama al servicio con el `operacionId` para obtener la lista de documentos generados
- [ ] Al confirmar el borrado, se llama al endpoint `DELETE` y el documento se elimina de la lista local sin recargar
- [ ] Al hacer clic en editar, se abre el editor con el `generatedDocumentId` correcto y los valores previos del documento
