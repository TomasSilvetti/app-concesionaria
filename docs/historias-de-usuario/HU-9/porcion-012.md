# porcion-012 — Sección "Documentos generados" en detalle de entidad [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-013
**Tipo:** FRONT
**Prerequisitos:** porcion-008
**Estado:** completada
**Completada el:** 2026-03-27

## Descripción

Crear la sección "Documentos generados" que aparece al pie del detalle de una operación o vehículo, mostrando los documentos generados para esa entidad con botones para descargar, editar (regenerar con nuevos valores) y borrar cada uno.

## Ejemplo de uso

Al pie del detalle de la operación de un Toyota Corolla aparece la sección "Documentos generados" con: "Contrato de compraventa — 15/03/2025 [Descargar] [Editar] [Borrar]". Al hacer clic en "Borrar", aparece un diálogo de confirmación. Al confirmar, el documento desaparece de la lista.

## Criterios de aceptación

- [ ] La sección se renderiza al pie del detalle de operación y al pie del detalle de vehículo
- [ ] Muestra la lista de documentos generados para esa entidad: nombre del archivo, fecha de creación, y botones Descargar / Editar / Borrar
- [ ] Si no hay documentos generados, la sección no se muestra (no ocupa espacio)
- [ ] El botón "Descargar" descarga el PDF directamente desde el navegador
- [ ] El botón "Editar" abre el modal de generación (porcion-010) precargado con los datos del documento, permitiendo modificar los campos manuales y regenerarlo
- [ ] El botón "Borrar" muestra un diálogo de confirmación antes de eliminar; al confirmar, el documento desaparece del listado
- [ ] La sección se actualiza automáticamente cuando se genera un nuevo documento (sin recargar la página)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] La sección no se renderiza cuando la lista de documentos está vacía
- [ ] Cada documento se muestra con su nombre de archivo y fecha formateada
- [ ] El diálogo de confirmación de borrado se muestra al hacer clic en "Borrar" y desaparece al cancelar
- [ ] Al cancelar el borrado, el documento permanece en la lista

### Pruebas de integración

- [ ] Al montar el componente, se llama al servicio con `contextType` y `contextId` para obtener los documentos generados
- [ ] Al confirmar el borrado, se llama al servicio de eliminación y el documento desaparece del listado
- [ ] Al generar un nuevo documento desde el mismo detalle, la sección se actualiza y muestra el nuevo documento
- [ ] Si el servicio de borrado falla, se muestra un mensaje de error y el documento permanece en la lista
