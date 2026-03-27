# porcion-005 — API crear plantilla con campos y PDF [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-27

## Descripción

Crear el endpoint que recibe el PDF, el nombre, el contexto y todos los recuadros configurados, y los persiste como un `DocumentTemplate` con sus `DocumentField` asociados. Incluye la lógica de validación de campos según su tipo y el esquema centralizado de rutas Auto por contexto.

## Ejemplo de uso

El editor de porcion-004 envía un `POST /api/admin/document-templates` con el PDF en binario, nombre "Contrato de compraventa", contexto `operacion` y un array de campos. El servidor valida que los campos Auto referencien rutas válidas del esquema de `operacion`, guarda todo y devuelve el `id` de la nueva plantilla.

## Criterios de aceptación

- [ ] `POST /api/admin/document-templates` acepta `multipart/form-data` con: el archivo PDF, `nombre` (string), `contexto` (`operacion` | `vehiculo`), y un array de campos con `nombre`, `tipo`, `valorFijo`/`rutaAuto` según tipo, `posX`, `posY`, `ancho`, `alto`, `orden`
- [ ] El endpoint valida que los campos de tipo `auto` referencien una ruta definida en el esquema de rutas del contexto correspondiente; devuelve 400 si la ruta no existe
- [ ] El endpoint valida que los campos de tipo `fijo` tengan `valorFijo` no vacío; devuelve 400 si falta
- [ ] La plantilla y todos sus campos se guardan en una única transacción (o nada se guarda si algo falla)
- [ ] El endpoint devuelve 201 con el `id` y `nombre` de la plantilla creada
- [ ] Solo accesible para usuarios con rol `admin`; devuelve 403 si no

## Pruebas

### Pruebas unitarias

- [ ] El validador de rutas Auto aprueba `operacion.cliente.nombre` para contexto `operacion`
- [ ] El validador de rutas Auto rechaza `vehiculo.patente` cuando el contexto es `operacion`
- [ ] El validador rechaza una ruta que no existe en el esquema (ej: `operacion.campoInexistente`)
- [ ] Un campo de tipo `fijo` con `valorFijo` vacío o nulo falla la validación con mensaje descriptivo

### Pruebas de integración

- [ ] `POST /api/admin/document-templates` con datos válidos crea `DocumentTemplate` y sus `DocumentField` en la BD y devuelve 201
- [ ] Si falla la validación de un campo, no se crea ningún registro (rollback de transacción) y devuelve 400
- [ ] `POST /api/admin/document-templates` con rol `usuario` devuelve 403
- [ ] Tras crear una plantilla, `GET /api/admin/document-templates/[id]` devuelve la plantilla con todos sus campos correctamente almacenados
