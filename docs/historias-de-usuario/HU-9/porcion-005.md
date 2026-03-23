# porcion-005 — API de upload, detección de campos y guardado de plantilla [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar el endpoint que recibe el archivo de plantilla (PDF o DOCX), lo procesa para detectar automáticamente los placeholders `{{campo}}` que contiene, y devuelve la lista de campos detectados al frontend. Un segundo endpoint guarda la plantilla junto con el mapeo de campos configurado por el empleado. Librerías: `mammoth` para DOCX y `pdfjs-dist` para PDF.

## Ejemplo de uso

El frontend envía el archivo PDF como `FormData` a `POST /api/documentos/plantillas/procesar`. El servidor extrae el texto, detecta los placeholders `{{nombre_cliente}}`, `{{precio}}`, `{{fecha}}` y los devuelve. Luego el frontend envía el mapeo configurado a `POST /api/documentos/plantillas` para guardar la plantilla completa en la BD.

## Criterios de aceptación

- [ ] `POST /api/documentos/plantillas/procesar` acepta un archivo PDF o DOCX como `multipart/form-data`
- [ ] El endpoint extrae todos los placeholders con formato `{{nombre}}` del contenido del archivo y los devuelve en la respuesta como array de strings únicos
- [ ] Si no se detectan placeholders, devuelve un array vacío (no es un error)
- [ ] `POST /api/documentos/plantillas` recibe: `nombre` (string), el archivo binario, y `campos` (objeto JSON con el mapeo `{ "{{placeholder}}": "campo_operacion" }`)
- [ ] La plantilla se guarda en la tabla `DocumentTemplate` asociada al `clienteId` del usuario autenticado
- [ ] Si ya existe una plantilla con el mismo nombre para ese cliente, devuelve error 409
- [ ] Ambos endpoints requieren autenticación; sin sesión válida devuelven 401
- [ ] Se valida que el archivo sea PDF o DOCX; cualquier otro formato devuelve 400

## Pruebas

### Pruebas unitarias

- [ ] La función de extracción de placeholders sobre un texto con `{{campo_a}}` y `{{campo_b}}` retorna `["{{campo_a}}", "{{campo_b}}"]`
- [ ] La función de extracción retorna un array vacío si el texto no contiene ningún placeholder `{{}}`
- [ ] La función de extracción elimina duplicados (si `{{campo}}` aparece dos veces, lo retorna una sola vez)
- [ ] El servicio de guardado lanza error si el `mimeType` del archivo no es `application/pdf` ni `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Pruebas de integración

- [ ] `POST /api/documentos/plantillas/procesar` con un DOCX que contiene `{{nombre}}` y `{{precio}}` retorna 200 con esos dos placeholders
- [ ] `POST /api/documentos/plantillas/procesar` con un archivo sin placeholders retorna 200 con array vacío
- [ ] `POST /api/documentos/plantillas` con datos válidos persiste el registro en `DocumentTemplate` y retorna 201 con el id generado
- [ ] `POST /api/documentos/plantillas` con nombre duplicado para el mismo cliente retorna 409
