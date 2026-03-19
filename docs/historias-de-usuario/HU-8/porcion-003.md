# porcion-003 — Endpoint creación de operación: aceptar nombreComprador [BACK]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Actualizar el endpoint de creación (y edición) de operaciones para que reciba, valide y persista el campo `nombreComprador`. El campo es obligatorio al crear y editable al modificar.

## Ejemplo de uso

El frontend envía un `POST /api/operations` con el cuerpo incluyendo `{ ..., "nombreComprador": "Juan Pérez" }`. El backend lo valida como requerido y lo guarda en la base de datos. La respuesta incluye el `nombreComprador` en el objeto de operación retornado.

## Criterios de aceptación

- [ ] El endpoint `POST /api/operations` acepta y persiste `nombreComprador`
- [ ] Si `nombreComprador` está ausente o vacío en el body, el endpoint devuelve error 400 con mensaje descriptivo
- [ ] El endpoint `PUT /api/operations/:id` (o equivalente) acepta actualizaciones de `nombreComprador`
- [ ] Las respuestas de operación (GET individual y listado) incluyen el campo `nombreComprador`
- [ ] El campo se persiste como texto libre sin transformaciones adicionales

## Pruebas

### Pruebas unitarias

- [ ] El validador del schema rechaza un body sin `nombreComprador` y devuelve error 400
- [ ] El validador acepta `nombreComprador` con cualquier string no vacío
- [ ] El servicio de creación mapea correctamente el campo al modelo de Prisma

### Pruebas de integración

- [ ] `POST /api/operations` con `nombreComprador: "Juan Pérez"` persiste el valor y lo retorna en la respuesta
- [ ] `POST /api/operations` sin `nombreComprador` devuelve 400
- [ ] `GET /api/operations/:id` de una operación creada con la nueva versión incluye `nombreComprador` en la respuesta
