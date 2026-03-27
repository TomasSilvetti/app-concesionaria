# porcion-003 — API CRUD básico de plantillas [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Crear los endpoints para listar, obtener el detalle y eliminar plantillas de documentos, accesibles únicamente para el rol `admin`. Estos endpoints alimentan el listado de la página `/admin/documentos`.

## Ejemplo de uso

La página `/admin/documentos` llama a `GET /api/admin/document-templates` y recibe la lista de plantillas con nombre, contexto y conteo de empresas asignadas. Al confirmar la eliminación de una plantilla, llama a `DELETE /api/admin/document-templates/[id]` y la plantilla desaparece.

## Criterios de aceptación

- [ ] `GET /api/admin/document-templates` devuelve la lista de plantillas con `id`, `nombre`, `contexto`, y cantidad de `DocumentAssignment` activos
- [ ] `GET /api/admin/document-templates/[id]` devuelve el detalle completo de una plantilla incluyendo sus `DocumentField` ordenados por `orden`
- [ ] `DELETE /api/admin/document-templates/[id]` elimina la plantilla y todos sus datos asociados en cascada
- [ ] Todos los endpoints verifican que el usuario autenticado tiene rol `admin`; devuelven 403 si no
- [ ] `DELETE` sobre un `id` inexistente devuelve 404
- [ ] Los endpoints no exponen el campo `pdfOriginal` (Bytes) en el listado ni en el detalle para evitar transferencias innecesarias

## Pruebas

### Pruebas unitarias

- [ ] El servicio de listado devuelve las plantillas con el conteo de asignaciones activas correctamente calculado
- [ ] El servicio de eliminación lanza un error reconocible si la plantilla no existe
- [ ] El middleware de autorización bloquea el acceso a usuarios con rol distinto de `admin`

### Pruebas de integración

- [ ] `GET /api/admin/document-templates` con rol `admin` devuelve 200 y array de plantillas
- [ ] `GET /api/admin/document-templates` con rol `usuario` devuelve 403
- [ ] `DELETE /api/admin/document-templates/[id]` con rol `admin` elimina la plantilla y devuelve 200
- [ ] `DELETE /api/admin/document-templates/[id-inexistente]` devuelve 404
- [ ] Tras eliminar una plantilla, `GET /api/admin/document-templates` ya no la incluye en la lista
