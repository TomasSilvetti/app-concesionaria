# HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación

**Como** empleado de la concesionaria,
**quiero** poder generar documentos oficiales desde el detalle de una operación, con los campos autocompletados a partir de los datos disponibles,
**para** agilizar la carga de documentación, reducir errores manuales y mantener todos los documentos asociados a cada operación centralizados en el sistema.

---

## Descripción

Se incorpora un nuevo módulo de "Documentos" al sistema, compuesto por dos partes integradas entre sí.

La **primera parte** vive dentro del detalle de cada operación: un nuevo botón "Generar documento" permite al empleado seleccionar una plantilla de documento disponible, revisar una vista previa con los campos ya autocompletados desde los datos de la operación, completar manualmente los campos que no pudieron inferirse, y finalmente guardar el documento generado. Los documentos generados quedan visibles al pie del detalle de la operación, con acciones para descargarlos, editarlos o borrarlos.

La **segunda parte** es una nueva página accesible desde el sidebar, llamada "Documentos", donde los empleados pueden subir nuevas plantillas (en formato PDF o DOCX) y configurar el mapeo de campos: qué dato de la operación autocompleta cada campo del documento. La configuración es visual: el empleado ve la vista previa del documento a la izquierda y el panel de campos disponibles a la derecha, pudiendo hacer clic en un campo del documento para asignarle una fuente de datos.

---

## Criterios de aceptación

- [ ] En el detalle de una operación, existe un botón "Generar documento" ubicado a la izquierda del botón "Editar".
- [ ] Al hacer clic en "Generar documento", se abre un modal con la lista de documentos disponibles para generar.
- [ ] Al seleccionar un documento del modal, se abre una vista previa/editor donde los campos mapeados aparecen autocompletados con los datos de la operación y los campos sin mapeo aparecen en blanco para completar manualmente.
- [ ] Los campos que no tienen información disponible en la operación se dejan en blanco (no se bloquea la generación).
- [ ] Una vez confirmada la generación, el documento se guarda en la base de datos asociado a la operación.
- [ ] Los documentos generados de una operación se muestran en una nueva sección al pie del detalle de esa operación.
- [ ] Cada documento generado tiene botones para: descargar, editar y borrar.
- [ ] Al borrar un documento generado, el sistema solicita confirmación antes de eliminarlo de la BD.
- [ ] Si no hay documentos configurados, el modal muestra un mensaje informativo y un acceso directo a la página de gestión de documentos.
- [ ] Existe una nueva página "Documentos" accesible desde el sidebar.
- [ ] Desde la página "Documentos" se pueden subir plantillas en formato PDF y DOCX.
- [ ] Al subir una plantilla, el sistema intenta detectar automáticamente los campos del documento.
- [ ] La página de configuración de una plantilla muestra la vista previa del documento (panel izquierdo) y la lista de campos disponibles de la operación (panel derecho).
- [ ] El empleado puede hacer clic en un campo del documento para asignarlo a un dato de la operación; los campos mapeados se resaltan visualmente.
- [ ] Si el sistema no detecta campos en el documento subido, se muestra un mensaje informativo; el documento se puede guardar igualmente, pero sin autocompletado.
- [ ] Los documentos configurados quedan disponibles para todos los empleados al momento de generar desde una operación.

---

## Flujos

### Flujo principal — Generar un documento desde el detalle de una operación

1. El empleado abre el detalle de una operación existente.
2. Hace clic en el botón "Generar documento", ubicado a la izquierda del botón "Editar".
3. Se abre un modal con la lista de documentos disponibles para generar.
4. El empleado selecciona un documento de la lista.
5. El sistema abre una vista previa/editor del documento con todos los campos mapeados ya autocompletados con los datos de la operación; los campos sin mapeo aparecen en blanco.
6. El empleado revisa la información, completa manualmente los campos que quedaron en blanco (si los hay) y confirma la generación.
7. El documento se guarda en la base de datos asociado a la operación y aparece en la sección "Documentos generados" al pie del detalle, con botones para descargar, editar y borrar.

### Flujo alternativo 1 — No hay documentos configurados

1. El empleado hace clic en "Generar documento".
2. El modal se abre con un estado vacío, mostrando el mensaje: "No hay documentos disponibles. Configurá uno desde la página de Documentos."
3. Se muestra un enlace o botón de acceso directo a la página de gestión de documentos.

### Flujo alternativo 2 — El empleado borra un documento generado

1. El empleado hace clic en el botón "Borrar" de un documento generado en el detalle de la operación.
2. El sistema muestra un diálogo de confirmación.
3. El empleado confirma la acción.
4. El documento se elimina de la base de datos y desaparece de la sección de documentos generados.

### Flujo principal — Configurar una nueva plantilla de documento (página "Documentos")

1. El empleado accede a la página "Documentos" desde el sidebar.
2. Hace clic en "Subir documento" y selecciona un archivo PDF o DOCX desde su equipo.
3. El sistema procesa el archivo e intenta detectar automáticamente sus campos.
4. Se abre la vista de configuración: panel izquierdo con la vista previa del documento y panel derecho con los campos disponibles de la operación.
5. El empleado hace clic en un campo del documento (panel izquierdo) y selecciona el dato de la operación que lo autocompletará (panel derecho).
6. Los campos mapeados se resaltan visualmente; los no mapeados permanecen sin resaltar.
7. El empleado guarda la configuración; el documento queda disponible para ser generado desde cualquier operación.

### Flujo alternativo 3 — El archivo subido no tiene campos detectables

1. El sistema procesa el archivo subido pero no detecta campos mapeables.
2. Se muestra el mensaje: "No se encontraron campos detectables en este documento. Podés guardarlo igual, pero no tendrá autocompletado."
3. El empleado puede guardar el documento sin configuración de mapeo; quedará disponible para generarse, pero todos sus campos deberán completarse manualmente.

---

## Ejemplos de uso

**Ejemplo 1 (happy path — generación):** Un vendedor abre la operación de venta de un Toyota Corolla. Hace clic en "Generar documento", selecciona "Contrato de compraventa" del modal. El sistema abre la vista previa con los campos nombre del cliente, DNI, marca, modelo, precio y fecha ya autocompletados. El campo "número de cuotas" aparece en blanco; el vendedor lo completa, confirma y el documento queda guardado y disponible para descargar desde el detalle de la operación.

**Ejemplo 2 (caso borde — campos sin datos):** Un administrativo genera un "Formulario de transferencia" para una operación donde el campo "número de escritura" no está cargado en el sistema. El campo aparece en blanco en la vista previa; el administrativo lo deja vacío, genera el documento igualmente y luego lo completa a mano antes de imprimirlo.

**Ejemplo 3 (configuración de plantilla):** Un administrativo sube un nuevo formulario de transferencia en PDF a la página de Documentos. El sistema detecta 8 campos. El administrativo mapea 6 de ellos con datos de la operación (nombre, CUIT, dominio, marca, modelo, precio) y deja 2 sin mapear porque son datos que siempre se completan manualmente. Guarda la configuración y el documento queda disponible para todos los empleados.

---

## Notas técnicas

- El componente de generación de documentos debe diseñarse de forma desacoplada del módulo de operaciones, ya que será reutilizado en otros módulos (ej. cobranzas para la generación de recibos).
