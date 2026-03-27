# porcion-001 — Migración BD — modelos de documentos [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** completada

## Descripción

Crear las cuatro tablas nuevas en la base de datos que soportan el módulo de documentos: la plantilla, los campos configurables de cada plantilla, la asignación de plantillas a empresas, y los documentos generados.

## Ejemplo de uso

El admin sube una plantilla "Contrato de compraventa" y el sistema la guarda en `DocumentTemplate`. Los 6 recuadros configurados se guardan en `DocumentField`. La asignación a dos empresas se guarda en `DocumentAssignment`. Cuando un empleado genera el documento final, se guarda en `GeneratedDocument` asociado a la operación.

## Criterios de aceptación

- [ ] Existe el modelo `DocumentTemplate` con campos: `id`, `clienteId` (admin dueño), `nombre`, `contexto` (`operacion` | `vehiculo`), `pdfOriginal` (Bytes), `mimeType`, `creadoEn`, `actualizadoEn`
- [ ] Existe el modelo `DocumentField` con campos: `id`, `templateId`, `nombre`, `tipo` (`auto` | `fijo` | `manual`), `valorFijo` (String opcional), `rutaAuto` (String opcional), `posX`, `posY`, `ancho`, `alto`, `orden`
- [ ] Existe el modelo `DocumentAssignment` con campos: `id`, `templateId`, `clienteId`, `activo`, `creadoEn`, `actualizadoEn`; con unique en `(templateId, clienteId)`
- [ ] Existe el modelo `GeneratedDocument` con campos: `id`, `templateId`, `clienteId`, `contexto`, `contextId` (id de la operación o vehículo), `pdfGenerado` (Bytes), `nombreArchivo`, `mimeType`, `creadoEn`, `actualizadoEn`
- [ ] Las relaciones entre modelos están correctamente definidas con `onDelete: Cascade` donde corresponde
- [ ] La migración se aplica sin errores en base de datos limpia y en base de datos existente con datos

## Pruebas

### Pruebas unitarias

- [ ] El modelo `DocumentTemplate` acepta valores `operacion` y `vehiculo` en el campo `contexto`, y rechaza cualquier otro valor
- [ ] El modelo `DocumentField` acepta los tipos `auto`, `fijo` y `manual`, y rechaza otros valores
- [ ] Un `DocumentField` con tipo `auto` puede tener `rutaAuto` nulo sin violar constraints
- [ ] Un `DocumentField` con tipo `fijo` puede tener `valorFijo` nulo sin violar constraints del ORM (la validación de negocio va en la capa de servicio)

### Pruebas de integración

- [ ] Al eliminar un `DocumentTemplate`, se eliminan en cascada todos sus `DocumentField` y `DocumentAssignment` asociados
- [ ] Al eliminar un `GeneratedDocument`, no se afectan la plantilla ni la entidad de contexto (operación o vehículo)
- [ ] Se puede crear un `DocumentAssignment` para la misma `(templateId, clienteId)` solo una vez; el segundo intento lanza error de constraint unique
- [ ] Se pueden crear múltiples `GeneratedDocument` para el mismo `contextId`, `templateId` y `clienteId` sin restricciones
