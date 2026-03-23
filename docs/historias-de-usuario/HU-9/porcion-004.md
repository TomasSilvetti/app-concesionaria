# porcion-004 — Upload y configuración visual de mapeo de campos [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** porcion-002

## Descripción

Implementar la vista de configuración de una plantilla: el flujo de subida de archivo (selector de archivo + validación de formato) y la pantalla de mapeo visual con panel izquierdo (vista previa del documento) y panel derecho (lista de campos disponibles de la operación). El empleado hace clic en un placeholder resaltado en la vista previa y lo asigna a un campo de la operación desde el panel derecho. En esta porción los datos de los placeholders detectados y los campos de operación son mockeados; la conexión real se hace en porcion-005.

## Ejemplo de uso

El empleado hace clic en "Subir documento", selecciona un PDF. El sistema muestra la vista de configuración: a la izquierda el documento renderizado con los placeholders resaltados en amarillo (ej: `{{nombre_cliente}}`, `{{precio}}`); a la derecha la lista de campos de la operación. El empleado hace clic en `{{nombre_cliente}}` y selecciona "Nombre del comprador" del panel derecho. El placeholder pasa a estar resaltado en verde indicando que está mapeado.

## Criterios de aceptación

- [ ] El selector de archivo acepta únicamente archivos PDF y DOCX; muestra error si se selecciona otro formato
- [ ] Se muestra el nombre del archivo seleccionado antes de subirlo, con opción de cancelar y elegir otro
- [ ] La vista de configuración divide la pantalla en panel izquierdo (vista previa) y panel derecho (campos disponibles)
- [ ] Los placeholders detectados (`{{campo}}`) se resaltan visualmente en la vista previa (color diferenciado)
- [ ] Al hacer clic en un placeholder, se abre un selector o se resalta el panel derecho para elegir el campo de la operación a mapear
- [ ] Los placeholders ya mapeados se resaltan en un color distinto a los no mapeados
- [ ] El panel derecho lista los campos disponibles de la operación (nombre comprador, marca, modelo, precio, fecha, etc.)
- [ ] Un campo de la operación puede asignarse a múltiples placeholders del documento
- [ ] El botón "Guardar" está disponible en todo momento (incluso con 0 campos mapeados); si no hay mapeo, muestra advertencia informativa pero no bloquea
- [ ] Si el sistema no detectó campos en el documento, se muestra el mensaje: "No se encontraron campos detectables en este documento. Podés guardarlo igual, pero no tendrá autocompletado."
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El selector de archivo rechaza archivos con extensión distinta a `.pdf` y `.docx` y muestra el mensaje de error correspondiente
- [ ] Al hacer clic en un placeholder no mapeado, el estado de selección activa cambia a ese placeholder
- [ ] Al asignar un campo a un placeholder, ese placeholder cambia de color (no mapeado → mapeado)
- [ ] Al desasignar un campo de un placeholder, vuelve al estado visual "no mapeado"
- [ ] Cuando la lista de placeholders detectados está vacía, se renderiza el mensaje informativo correcto

### Pruebas de integración

- [ ] Al seleccionar un archivo válido y hacer clic en "Subir", se llama al servicio con el archivo como `FormData`
- [ ] Los placeholders retornados por el servicio se renderizan resaltados en la vista previa
- [ ] Al hacer clic en "Guardar" con mapeo parcial, se llama al servicio con el mapeo actual (incluyendo solo los campos asignados)
