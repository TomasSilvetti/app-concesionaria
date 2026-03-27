# porcion-004 — Editor visual de plantilla — subir PDF y dibujar recuadros [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completado

## Descripción

Crear el flujo de creación de plantilla: formulario para subir un PDF, vista previa del documento sobre la cual el admin puede dibujar recuadros de texto arrastrando el mouse, y panel de configuración de cada recuadro (nombre, tipo Auto/Fijo/Manual y valor según tipo). Al finalizar, el admin ingresa un nombre para la plantilla, selecciona el contexto y guarda.

## Ejemplo de uso

El admin hace clic en "Nueva plantilla", sube "contrato.pdf" y ve el documento renderizado. Arrastra para dibujar un recuadro sobre el campo "Nombre del cliente" y lo configura como Auto → `operacion.cliente.nombre`. Dibuja otro recuadro, lo llama "Cuotas" y lo marca como Manual. Escribe "Contrato de compraventa" como nombre, elige el contexto `operacion` y hace clic en "Guardar plantilla".

## Criterios de aceptación

- [ ] El admin puede seleccionar un archivo PDF desde su equipo; se valida que el archivo sea PDF antes de procesarlo
- [ ] El PDF seleccionado se renderiza como vista previa dentro de la herramienta (al menos la primera página visible)
- [ ] El admin puede dibujar recuadros sobre el PDF arrastrando el mouse; los recuadros quedan visibles con un borde distinguible
- [ ] Cada recuadro tiene un panel de configuración que permite asignarle: nombre, tipo (Auto / Fijo / Manual) y valor según el tipo seleccionado
  - Tipo **Auto**: muestra un selector con los campos disponibles del contexto elegido (ej: `operacion.cliente.nombre`, `operacion.precioVentaTotal`, etc.)
  - Tipo **Fijo**: muestra un input de texto para escribir el valor estático
  - Tipo **Manual**: no requiere campo adicional
- [ ] El admin puede eliminar un recuadro haciendo clic en él y seleccionando "Eliminar"
- [ ] Hay un campo de texto para el nombre de la plantilla y un selector de contexto (`Operación` / `Vehículo`)
- [ ] El botón "Guardar plantilla" está deshabilitado si: no hay PDF seleccionado, no hay nombre, no hay contexto, o algún recuadro no tiene nombre ni tipo asignado
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al seleccionar un archivo no-PDF, se muestra un error y no se renderiza la vista previa
- [ ] El botón "Guardar plantilla" está deshabilitado cuando el nombre de la plantilla está vacío
- [ ] El botón "Guardar plantilla" está deshabilitado cuando no se ha seleccionado contexto
- [ ] Al cambiar el tipo de un recuadro de `auto` a `manual`, el campo de ruta/valor se oculta y limpia
- [ ] Un recuadro sin nombre muestra un indicador de error en el panel de configuración

### Pruebas de integración

- [ ] Al hacer clic en "Guardar plantilla" con todos los datos completos, se envía al servicio el objeto con el PDF, el nombre, el contexto y todos los recuadros configurados con sus posiciones y tipos
- [ ] Si el servicio devuelve error, se muestra un mensaje de error y el formulario no se cierra
- [ ] Si el servicio responde con éxito, se cierra el editor y se actualiza el listado de plantillas
