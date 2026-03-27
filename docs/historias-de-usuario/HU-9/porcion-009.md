# porcion-009 — API plantillas disponibles por empresa y contexto [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-008
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-007

## Descripción

Crear el endpoint que, dado un contexto (`operacion` o `vehiculo`) y el id de una entidad, devuelve la lista de plantillas activas asignadas a la empresa del usuario autenticado para ese contexto. Este endpoint lo consume el componente `GenerarDocumentoButton` para decidir si mostrar o no el botón.

## Ejemplo de uso

El componente de porcion-008 llama a `GET /api/document-templates/available?contextType=operacion&contextId=op-123`. El servidor identifica la empresa del usuario, busca plantillas activas para esa empresa con contexto `operacion` y devuelve `[{ id: "t-1", nombre: "Contrato de compraventa" }]`. Si no hay, devuelve `[]`.

## Criterios de aceptación

- [ ] `GET /api/document-templates/available` acepta query params `contextType` y `contextId`
- [ ] Devuelve solo las plantillas con `DocumentAssignment.activo = true` para la empresa del usuario autenticado y el `contexto` indicado
- [ ] La respuesta incluye al menos `id` y `nombre` de cada plantilla; no expone el `pdfOriginal`
- [ ] Si no hay plantillas disponibles, devuelve array vacío `[]` con status 200 (no es un error)
- [ ] Accesible para cualquier usuario autenticado (no requiere rol `admin`)
- [ ] `contextType` con valor inválido devuelve 400

## Pruebas

### Pruebas unitarias

- [ ] El servicio filtra correctamente por `clienteId` del usuario y el `contexto` indicado
- [ ] El servicio devuelve array vacío si no hay asignaciones activas, sin lanzar error
- [ ] El servicio rechaza `contextType` con valor distinto de `operacion` o `vehiculo`

### Pruebas de integración

- [ ] `GET /api/document-templates/available?contextType=operacion&contextId=op-1` devuelve las plantillas activas para la empresa del usuario con contexto `operacion`
- [ ] Si la empresa tiene plantillas asignadas pero todas inactivas, devuelve `[]`
- [ ] Si la empresa no tiene ninguna asignación, devuelve `[]`
- [ ] `GET /api/document-templates/available?contextType=invalido&contextId=op-1` devuelve 400
- [ ] Un usuario no autenticado recibe 401
