# porcion-013 — API CRUD de documentos generados [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-012
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-03-27
**Prerequisitos:** porcion-001, porcion-011

## Descripción

Crear los endpoints para listar, descargar, actualizar (regenerar con nuevos valores de campos manuales) y eliminar documentos generados asociados a una entidad (operación o vehículo). Solo el usuario de la misma empresa puede operar sobre sus documentos.

## Ejemplo de uso

La sección de porcion-012 llama a `GET /api/documents?contextType=operacion&contextId=op-123` y recibe la lista de documentos. Al hacer clic en "Descargar", el navegador llama a `GET /api/documents/[id]/download` y recibe el PDF. Al confirmar el borrado, llama a `DELETE /api/documents/[id]`.

## Criterios de aceptación

- [ ] `GET /api/documents?contextType=&contextId=` devuelve la lista de documentos generados para esa entidad y empresa del usuario (sin el binario del PDF): `id`, `nombreArchivo`, `creadoEn`, `actualizadoEn`
- [ ] `GET /api/documents/[id]/download` devuelve el binario del PDF con headers `Content-Type: application/pdf` y `Content-Disposition: attachment; filename=...`
- [ ] `PUT /api/documents/[id]` recibe nuevos `manualFields`, regenera el PDF usando el mismo template y entidad, y actualiza `GeneratedDocument.pdfGenerado` y `actualizadoEn`
- [ ] `DELETE /api/documents/[id]` elimina el registro `GeneratedDocument`
- [ ] Todos los endpoints verifican que el documento pertenece a la empresa del usuario autenticado; devuelven 403 si no
- [ ] Operaciones sobre `id` inexistente devuelven 404

## Pruebas

### Pruebas unitarias

- [ ] El servicio de listado no incluye el campo `pdfGenerado` (Bytes) en la respuesta para evitar transferencias innecesarias
- [ ] El servicio de descarga devuelve el binario completo con el `Content-Type` correcto
- [ ] El servicio de actualización reutiliza la misma lógica de generación de porcion-011 con los nuevos `manualFields`
- [ ] El servicio de eliminación lanza error reconocible si el documento no existe

### Pruebas de integración

- [ ] `GET /api/documents?contextType=operacion&contextId=op-1` devuelve los documentos del usuario correctamente
- [ ] `GET /api/documents?contextType=operacion&contextId=op-1` de otro usuario/empresa devuelve `[]` (no 403, no expone existencia)
- [ ] `GET /api/documents/[id]/download` devuelve el PDF descargable con headers correctos
- [ ] `DELETE /api/documents/[id]` elimina el registro y devuelve 200; una segunda llamada devuelve 404
- [ ] `PUT /api/documents/[id]` actualiza el PDF generado y `actualizadoEn` en la BD
- [ ] `GET /api/documents/[id-de-otra-empresa]/download` devuelve 403
