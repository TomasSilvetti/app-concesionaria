# HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual

**Como** administrador del sistema,
**quiero** poder crear y configurar plantillas de documentos con campos mapeables, y asignarlas a empresas concesionarias,
**para** que los empleados de cada empresa puedan generar documentos oficiales autocompletados directamente desde el contexto donde corresponda (operación o vehículo).

---

## Descripción

Se incorpora un módulo de documentos compuesto por dos partes diferenciadas por rol.

La **primera parte** es un backoffice exclusivo para el rol `admin`, accesible desde `/admin/documentos`. Desde aquí el admin sube plantillas en PDF, coloca recuadros de texto sobre el documento y configura cómo se completará cada campo (con un dato de la app, con un valor fijo, o manualmente por el empleado). El admin también define el **contexto** de cada plantilla (`operacion` o `vehiculo`) y la asigna a las empresas concesionarias que la tendrán disponible.

La **segunda parte** vive dentro de los módulos de operaciones y stock. Cuando una empresa tiene plantillas activas asignadas para el contexto correspondiente, aparece un botón **"Generar documento"** junto al botón "Editar" en el detalle de la operación o del vehículo. El empleado selecciona una plantilla, completa los campos manuales si los hay, y genera el documento, que queda guardado y disponible para descargar, editar o borrar.

---

## Contextos soportados

| Contexto | Dónde aparece el botón "Generar documento" |
|---|---|
| `operacion` | Detalle de operación, junto al botón "Editar" |
| `vehiculo` | Detalle de vehículo, junto al botón "Editar" |

El botón solo es visible si la empresa del empleado tiene al menos una plantilla activa asignada para ese contexto.

---

## Tipos de campo en una plantilla

| Tipo | Comportamiento |
|---|---|
| **Auto** | Se completa con un dato de la app (ej: `operacion.cliente.nombre`, `vehiculo.patente`) |
| **Fijo** | Siempre tiene el mismo valor, configurado por el admin (ej: nombre de la empresa) |
| **Manual** | El empleado lo completa en el momento de generar el documento |

---

## Criterios de aceptación

### Backoffice admin

- [ ] Existe una página `/admin/documentos` accesible únicamente para usuarios con rol `admin`.
- [ ] Desde la página el admin puede subir una plantilla en formato PDF.
- [ ] Al subir la plantilla, se muestra una vista previa del PDF sobre la cual el admin puede dibujar recuadros de texto.
- [ ] Cada recuadro tiene un nombre asignable por el admin.
- [ ] Por cada recuadro, el admin elige el tipo: Auto, Fijo o Manual.
  - Si es **Auto**: selecciona el dato de la app que lo completará (selector con los campos disponibles del contexto elegido).
  - Si es **Fijo**: escribe el valor estático que siempre se usará.
  - Si es **Manual**: no requiere configuración adicional.
- [ ] El admin define el contexto de la plantilla (`operacion` o `vehiculo`).
- [ ] El admin guarda la plantilla con un nombre.
- [ ] Desde el portal de documentos, el admin puede asignar cada plantilla a una o varias empresas (activo/inactivo por empresa).
- [ ] Las plantillas desactivadas para una empresa dejan de aparecer en el modal de generación de esa empresa.

### Generación por el empleado

- [ ] En el detalle de una operación, el botón "Generar documento" aparece junto al botón "Editar" si la empresa tiene plantillas activas con contexto `operacion`.
- [ ] En el detalle de un vehículo, el botón "Generar documento" aparece junto al botón "Editar" si la empresa tiene plantillas activas con contexto `vehiculo`.
- [ ] Al hacer clic en "Generar documento", se abre un modal con la lista de plantillas disponibles para esa empresa y contexto.
- [ ] Al seleccionar una plantilla, se abre una vista previa del PDF con los campos Auto y Fijo ya completados y los campos Manual en blanco.
- [ ] Si un campo Auto no tiene datos disponibles en la entidad actual, se muestra en blanco sin bloquear la generación.
- [ ] El empleado completa los campos Manual, revisa la vista previa y confirma la generación.
- [ ] El documento generado se guarda en la base de datos asociado a la entidad (operación o vehículo) y a la empresa.
- [ ] Los documentos generados se muestran en una sección al pie del detalle de la entidad correspondiente.
- [ ] Cada documento generado tiene botones para: descargar, editar y borrar.
- [ ] Al borrar un documento generado, el sistema solicita confirmación antes de eliminarlo.
- [ ] Si no hay plantillas disponibles para esa empresa y contexto, el modal muestra el mensaje: "No hay documentos disponibles para este módulo."

---

## Flujos

### Flujo principal — Admin crea una nueva plantilla

1. El admin accede a `/admin/documentos`.
2. Hace clic en "Nueva plantilla" y sube un archivo PDF.
3. El sistema muestra la vista previa del PDF.
4. El admin dibuja recuadros sobre los campos completables del documento y les asigna un nombre a cada uno.
5. Por cada recuadro, el admin elige el tipo (Auto / Fijo / Manual) y lo configura según corresponda.
6. El admin selecciona el contexto de la plantilla (`operacion` o `vehiculo`).
7. El admin guarda la plantilla con un nombre descriptivo.
8. Desde el listado de plantillas, el admin asigna la plantilla a las empresas que la tendrán disponible.

### Flujo principal — Empleado genera un documento desde una operación

1. El empleado abre el detalle de una operación.
2. Hace clic en el botón "Generar documento", ubicado junto al botón "Editar".
3. Se abre un modal con la lista de plantillas disponibles para su empresa con contexto `operacion`.
4. El empleado selecciona una plantilla.
5. Se abre la vista previa del PDF: campos Auto y Fijo ya completados, campos Manual en blanco.
6. El empleado completa los campos Manual y confirma la generación.
7. El documento se guarda y aparece en la sección "Documentos generados" al pie del detalle, con botones para descargar, editar y borrar.

### Flujo principal — Empleado genera un documento desde el detalle de un vehículo

Idéntico al flujo anterior, pero desde el detalle de un vehículo con contexto `vehiculo`.

### Flujo alternativo — No hay plantillas disponibles

1. El empleado hace clic en "Generar documento".
2. El modal muestra el mensaje: "No hay documentos disponibles para este módulo."

### Flujo alternativo — El empleado borra un documento generado

1. El empleado hace clic en "Borrar" sobre un documento generado.
2. El sistema muestra un diálogo de confirmación.
3. El empleado confirma.
4. El documento se elimina de la base de datos y desaparece del listado.

---

## Ejemplos de uso

**Ejemplo 1 (creación de plantilla):** El admin sube un "Contrato de compraventa" en PDF. Dibuja 6 recuadros: nombre del cliente (Auto → `operacion.cliente.nombre`), DNI (Auto → `operacion.cliente.dni`), marca (Auto → `operacion.marcaNombre`), modelo (Auto → `operacion.modelo`), precio (Auto → `operacion.precioVentaTotal`), y número de cuotas (Manual). Define el contexto como `operacion`, lo llama "Contrato de compraventa" y lo asigna a las empresas que lo necesiten.

**Ejemplo 2 (generación — happy path):** Un vendedor abre la operación de un Toyota Corolla. Hace clic en "Generar documento" y selecciona "Contrato de compraventa". Los campos nombre, DNI, marca, modelo y precio aparecen autocompletados. Completa el campo "número de cuotas" manualmente, confirma, y el documento queda disponible para descargar desde el detalle de la operación.

**Ejemplo 3 (campo Auto sin datos):** El admin tiene mapeado el campo "CUIT" a `operacion.cliente.cuit`, pero esa operación no tiene el CUIT cargado. El campo aparece en blanco; el empleado puede completarlo manualmente o generar el documento igualmente.

**Ejemplo 4 (campo fijo):** El admin configuró el campo "Nombre empresa vendedora" como Fijo con valor "Concesionaria XYZ S.A.". Ese campo siempre aparece completado con ese valor en cualquier documento generado, sin intervención del empleado.

---

## Notas técnicas

- El modelo de datos debe incluir: `DocumentTemplate` (plantilla), `DocumentField` (recuadros con tipo y configuración), `DocumentAssignment` (plantilla × empresa × activo), y `GeneratedDocument` (documento generado × entidad × empresa).
- Los campos Auto referencian rutas de datos disponibles en el contexto (ej: `operacion.cliente.nombre`). Estas rutas deben mantenerse en un esquema centralizado por contexto para facilitar la incorporación de nuevos campos.
- El botón "Generar documento" debe implementarse como un componente reutilizable que recibe el `contextType` y el `contextId`, de modo que pueda añadirse a cualquier módulo futuro sin cambios estructurales.
- La página `/admin/documentos` debe protegerse a nivel de middleware verificando el rol `admin`.
