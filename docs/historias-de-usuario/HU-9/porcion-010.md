# porcion-010 — API de documentos generados — listar, descargar y borrar [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-009
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints para gestionar los documentos ya generados de una operación: listarlos (sin el binario), descargar el archivo de un documento específico y eliminar un documento. Estos endpoints son consumidos por la sección "Documentos generados" del detalle de la operación.

## Ejemplo de uso

La sección "Documentos generados" llama a `GET /api/documentos/generados?operacionId=xxx` y recibe la lista de documentos de esa operación. Al hacer clic en "Descargar", el navegador llama a `GET /api/documentos/generados/:id/archivo` y recibe el binario del documento para descargarlo. Al confirmar el borrado, llama a `DELETE /api/documentos/generados/:id` y el documento se elimina de la BD.

## Criterios de aceptación

- [ ] `GET /api/documentos/generados?operacionId=:id` devuelve todos los documentos generados para esa operación, sin incluir el campo `datos` (binario)
- [ ] La respuesta incluye: `id`, `nombreArchivo`, `mimeType`, `plantillaId`, nombre de la plantilla, `creadoEn`
- [ ] El endpoint verifica que la operación pertenezca al cliente autenticado; si no, devuelve 403
- [ ] `GET /api/documentos/generados/:id/archivo` devuelve el binario del documento con el `Content-Type` y `Content-Disposition` correctos para forzar la descarga
- [ ] `DELETE /api/documentos/generados/:id` elimina el documento si pertenece al cliente autenticado
- [ ] Si el `id` no existe o pertenece a otro cliente, el endpoint devuelve 404
- [ ] Todos los endpoints requieren autenticación; sin sesión válida devuelven 401

## Pruebas

### Pruebas unitarias

- [ ] El servicio de listado filtra por `operacionId` y no retorna el campo `datos` en la respuesta
- [ ] El servicio de listado verifica que el `operacionId` pertenezca al `clienteId` del usuario autenticado antes de retornar datos
- [ ] El servicio de eliminación retorna error si el `id` del documento no pertenece al cliente autenticado
- [ ] El servicio de descarga retorna el buffer con el `mimeType` correcto según el tipo de archivo (PDF o DOCX)

### Pruebas de integración

- [ ] `GET /api/documentos/generados?operacionId=xxx` sin sesión devuelve 401
- [ ] `GET /api/documentos/generados?operacionId=xxx` con operación válida devuelve 200 y la lista de documentos sin el binario
- [ ] `GET /api/documentos/generados/:id/archivo` con id válido devuelve 200 con el archivo y los headers de descarga correctos
- [ ] `DELETE /api/documentos/generados/:id` con id válido devuelve 200 y el registro se elimina de la BD
- [ ] `DELETE /api/documentos/generados/:id` con id de documento de otro cliente devuelve 404
