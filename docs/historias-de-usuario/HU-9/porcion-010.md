# porcion-010 — Modal de generación: preview con campos autocompletados y formulario manual [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-011
**Tipo:** FRONT
**Prerequisitos:** porcion-008
**Estado:** completada

## Descripción

Crear el modal que se abre tras seleccionar una plantilla, muestra una vista previa del PDF con los campos Auto y Fijo ya completados visualmente sobre el documento, los campos Manual como inputs editables superpuestos, y un botón de confirmación para generar y guardar el documento.

## Ejemplo de uso

El empleado selecciona "Contrato de compraventa". Se abre el modal mostrando el PDF con "Juan Pérez" y "DNI 28.456.789" ya escritos en sus recuadros correspondientes. El recuadro "Número de cuotas" aparece como un input en blanco. El empleado escribe "12", revisa el documento y hace clic en "Generar documento".

## Criterios de aceptación

- [ ] El modal recibe `templateId`, `contextType` y `contextId` y carga la vista previa del PDF con los campos superpuestos
- [ ] Los campos de tipo Auto y Fijo aparecen con sus valores ya escritos sobre el recuadro en la posición configurada
- [ ] Si un campo Auto no tiene datos disponibles en la entidad (campo nulo o inexistente), el recuadro aparece en blanco sin bloquear la generación
- [ ] Los campos de tipo Manual aparecen como inputs de texto editables en la posición del recuadro
- [ ] El botón "Generar documento" está deshabilitado si algún campo Manual está vacío
- [ ] Al hacer clic en "Generar documento" con todos los campos completados, se envía al servicio la información necesaria para generar el PDF
- [ ] Mientras se procesa la generación, el botón muestra un estado de carga y está deshabilitado
- [ ] Tras generarse con éxito, el modal se cierra y se actualiza la sección de documentos generados
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Los campos Auto y Fijo se renderizan con sus valores pre-cargados en la posición correcta del canvas
- [ ] Un campo Auto con valor nulo se renderiza como recuadro vacío sin mostrar error
- [ ] El botón "Generar documento" está deshabilitado cuando hay al menos un campo Manual vacío
- [ ] El botón "Generar documento" está habilitado cuando todos los campos Manual tienen valor

### Pruebas de integración

- [ ] Al montar el modal, se llama al servicio para obtener los datos de la plantilla y los valores del contexto (operación o vehículo) y se renderizan sobre el PDF
- [ ] Al confirmar la generación, se envía al servicio el `templateId`, `contextType`, `contextId` y los valores de los campos Manual ingresados por el usuario
- [ ] Si el servicio de generación falla, se muestra un mensaje de error y el modal permanece abierto
- [ ] Si el servicio responde con éxito, el modal se cierra y el componente padre recibe la notificación para actualizar la sección de documentos
