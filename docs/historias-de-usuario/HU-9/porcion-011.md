# porcion-011 — API generar y guardar documento [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-010
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-009
**Estado:** completada

## Descripción

Crear el endpoint que recibe la plantilla seleccionada, el contexto, el id de la entidad y los valores de los campos manuales, genera el PDF final sobreimprimiendo todos los valores sobre el PDF original, y guarda el documento generado como un `GeneratedDocument` en la base de datos.

## Ejemplo de uso

El modal de porcion-010 llama a `POST /api/documents/generate` con `{ templateId, contextType: "operacion", contextId: "op-123", manualFields: { "Número de cuotas": "12" } }`. El servidor carga el PDF original, obtiene los datos de la operación, imprime cada campo en su posición y guarda el PDF resultante. Devuelve el `id` y metadatos del documento generado.

## Criterios de aceptación

- [ ] `POST /api/documents/generate` recibe `templateId`, `contextType`, `contextId` y `manualFields` (objeto con los valores de los campos manuales)
- [ ] El servidor carga el `pdfOriginal` de la plantilla, resuelve los valores de los campos Auto desde la entidad indicada por `contextType` + `contextId`, aplica los valores Fijos, y utiliza los valores de `manualFields` para los campos Manual
- [ ] Los valores se escriben sobre el PDF en las coordenadas (`posX`, `posY`, `ancho`, `alto`) de cada `DocumentField`
- [ ] Si un campo Auto no tiene datos en la entidad, se deja en blanco sin lanzar error
- [ ] El PDF generado se guarda en `GeneratedDocument` con `clienteId` del usuario, `templateId`, `contexto`, `contextId`, y el binario del PDF
- [ ] El nombre del archivo generado sigue el patrón `{nombre-plantilla}-{fecha}-{contextId}.pdf`
- [ ] Devuelve 201 con el `id`, `nombreArchivo` y `creadoEn` del documento generado
- [ ] Si el `templateId` no existe o la plantilla no está activa para la empresa del usuario, devuelve 403

## Pruebas

### Pruebas unitarias

- [ ] El resolvedor de campos Auto devuelve el valor correcto para `operacion.cliente.nombre` dado una operación con cliente
- [ ] El resolvedor devuelve `null` (sin lanzar error) cuando la ruta Auto apunta a un campo nulo o inexistente en la entidad
- [ ] El generador de nombre de archivo produce el formato correcto usando nombre de plantilla, fecha y contextId

### Pruebas de integración

- [ ] `POST /api/documents/generate` con datos válidos crea un registro `GeneratedDocument` en la BD y devuelve 201
- [ ] El PDF binario guardado en `GeneratedDocument.pdfGenerado` es un PDF válido y descargable
- [ ] Si `templateId` no existe, devuelve 404
- [ ] Si la plantilla existe pero no está asignada y activa para la empresa del usuario, devuelve 403
- [ ] Un campo Manual faltante en `manualFields` no impide la generación (se deja en blanco), dado que la validación es responsabilidad del frontend
