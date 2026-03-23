# porcion-008 — API de generación y guardado de documento [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-007
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-005

## Descripción

Implementar el endpoint que recibe la plantilla seleccionada, los valores de los campos (mapeados desde la operación + completados manualmente), genera el archivo final reemplazando todos los placeholders con sus valores reales, y guarda el documento resultante en la tabla `GeneratedDocument` asociado a la operación. Usa `docxtemplater` para DOCX y `pdf-lib` para PDF.

## Ejemplo de uso

El frontend envía a `POST /api/documentos/generados` el `plantillaId`, el `operacionId` y el objeto de valores `{ "{{nombre_cliente}}": "Juan Pérez", "{{precio}}": "1500000", "{{cuotas}}": "12" }`. El servidor toma el archivo binario de la plantilla, reemplaza los placeholders, guarda el resultado en `GeneratedDocument` y devuelve el `id` del documento generado.

## Criterios de aceptación

- [ ] `POST /api/documentos/generados` recibe: `plantillaId`, `operacionId`, y `valores` (objeto `{ "{{placeholder}}": "valor_final" }`)
- [ ] El endpoint verifica que la plantilla y la operación pertenezcan al mismo cliente autenticado; si no, devuelve 403
- [ ] El servidor reemplaza todos los placeholders del archivo binario con los valores recibidos
- [ ] Los placeholders sin valor en el objeto `valores` se reemplazan por string vacío (no bloquea la generación)
- [ ] El documento generado se guarda en `GeneratedDocument` con los campos: `operacionId`, `plantillaId`, `nombreArchivo` (basado en el nombre de la plantilla + fecha), `mimeType`, `datos` (binario del archivo generado)
- [ ] El endpoint devuelve 201 con el `id` del `GeneratedDocument` creado
- [ ] El endpoint también expone `GET /api/documentos/plantillas/:id/datos` para que el frontend pueda obtener el binario de la plantilla y renderizar la vista previa
- [ ] Requiere autenticación; sin sesión válida devuelve 401

## Pruebas

### Pruebas unitarias

- [ ] La función de reemplazo de placeholders sobre un buffer DOCX sustituye correctamente `{{nombre}}` por el valor dado
- [ ] La función de reemplazo deja vacío el placeholder si su clave no está presente en el objeto `valores`
- [ ] El servicio lanza error 403 si el `operacionId` no pertenece al cliente del usuario autenticado
- [ ] El servicio lanza error 404 si el `plantillaId` no existe en la BD

### Pruebas de integración

- [ ] `POST /api/documentos/generados` con datos válidos persiste un registro en `GeneratedDocument` y retorna 201 con el id
- [ ] `POST /api/documentos/generados` para la misma operación dos veces crea dos registros distintos (sin restricción de unicidad)
- [ ] `GET /api/documentos/plantillas/:id/datos` retorna el binario del archivo con el `Content-Type` correcto
- [ ] `POST /api/documentos/generados` con `plantillaId` de otro cliente retorna 403
