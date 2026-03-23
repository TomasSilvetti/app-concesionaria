# porcion-003 — API de plantillas — listar y eliminar [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints necesarios para que la página de Documentos pueda listar las plantillas del cliente y eliminar una plantilla existente. Los endpoints devuelven los metadatos de la plantilla (sin el binario del archivo) para no sobrecargar la respuesta del listado.

## Ejemplo de uso

La página "Documentos" llama a `GET /api/documentos/plantillas` y recibe la lista de plantillas del cliente con nombre, tipo y fecha de creación. Al confirmar el borrado, llama a `DELETE /api/documentos/plantillas/:id` y la plantilla desaparece de la BD.

## Criterios de aceptación

- [ ] `GET /api/documentos/plantillas` devuelve todas las plantillas del cliente autenticado, sin incluir el campo `archivoDatos` (binario)
- [ ] La respuesta incluye: `id`, `nombre`, `archivoNombre`, `archivoMimeType`, `campos`, `creadoEn`
- [ ] `DELETE /api/documentos/plantillas/:id` elimina la plantilla si pertenece al cliente autenticado
- [ ] Si el `id` no existe o pertenece a otro cliente, el endpoint devuelve 404
- [ ] Ambos endpoints requieren autenticación; sin sesión válida devuelven 401
- [ ] Al eliminar una plantilla, los `GeneratedDocument` asociados se eliminan en cascada (o se maneja según la política definida en porcion-001)

## Pruebas

### Pruebas unitarias

- [ ] El servicio de listado filtra plantillas por `clienteId` y no retorna el campo `archivoDatos`
- [ ] El servicio de eliminación retorna error si el `id` no pertenece al `clienteId` del usuario autenticado
- [ ] El servicio de eliminación retorna error si el `id` no existe en la BD

### Pruebas de integración

- [ ] `GET /api/documentos/plantillas` sin sesión devuelve 401
- [ ] `GET /api/documentos/plantillas` con sesión válida devuelve 200 y lista solo las plantillas del cliente
- [ ] `DELETE /api/documentos/plantillas/:id` con id de otro cliente devuelve 404
- [ ] `DELETE /api/documentos/plantillas/:id` con id válido devuelve 200 y el registro se elimina de la BD
