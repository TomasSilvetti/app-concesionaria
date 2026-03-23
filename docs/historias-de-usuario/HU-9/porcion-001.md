# porcion-001 — Migración BD — tablas DocumentTemplate y GeneratedDocument [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear en la base de datos las dos tablas nuevas que necesita el módulo de documentos: `DocumentTemplate` (plantillas configuradas con su mapeo de campos) y `GeneratedDocument` (documentos generados a partir de una plantilla y asociados a una operación). El modelo `OperationDocument` existente no se toca.

## Ejemplo de uso

Una vez aplicada la migración, el sistema puede persistir una plantilla "Contrato de compraventa" con su archivo y su mapeo de campos, y luego guardar múltiples documentos generados a partir de esa plantilla para distintas operaciones.

## Criterios de aceptación

- [ ] Existe el modelo `DocumentTemplate` con los campos: `id`, `clienteId`, `nombre`, `archivoNombre`, `archivoMimeType`, `archivoDatos` (Bytes), `campos` (Json — mapeo `{{placeholder}}` → campo de la operación), `creadoEn`, `actualizadoEn`
- [ ] `DocumentTemplate` tiene relación con `Client` (cascade delete)
- [ ] Existe el modelo `GeneratedDocument` con los campos: `id`, `operacionId`, `plantillaId`, `nombreArchivo`, `mimeType`, `datos` (Bytes), `creadoEn`, `actualizadoEn`
- [ ] `GeneratedDocument` tiene relación con `Operation` (cascade delete) y con `DocumentTemplate`
- [ ] Una operación puede tener **múltiples** `GeneratedDocument` (sin restricción `@unique` en `operacionId`)
- [ ] La migración se aplica sin errores en la base de datos de desarrollo
- [ ] El cliente Prisma se regenera correctamente tras la migración

## Pruebas

### Pruebas unitarias

- [ ] Se puede crear un `DocumentTemplate` con campos Json válidos y el registro se persiste correctamente
- [ ] Se puede crear un `DocumentTemplate` con `campos` vacío (`{}`) sin errores de validación
- [ ] Se pueden crear múltiples `GeneratedDocument` con el mismo `operacionId` sin conflicto de unicidad
- [ ] Al eliminar un `Client`, se eliminan en cascada todos sus `DocumentTemplate`

### Pruebas de integración

- [ ] Al eliminar una `Operation`, se eliminan en cascada todos sus `GeneratedDocument` asociados
- [ ] Al eliminar un `DocumentTemplate`, los `GeneratedDocument` asociados se eliminan o manejan según la política definida (cascade o restrict)
