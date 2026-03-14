# porcion-031 — Eliminación con validación — endpoint DELETE con protección [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-030
**Tipo:** BACK
**Prerequisitos:** porcion-017

## Descripción

Crear el endpoint DELETE `/api/stock/[id]` que elimine un vehículo del stock solo si no está asociado a ninguna operación. Si el vehículo tiene `operacionId` no null, el endpoint debe devolver error 400 con un mensaje indicando el ID de la operación asociada.

## Ejemplo de uso

Al recibir DELETE `/api/stock/abc123`, el endpoint verifica si el vehículo tiene `operacionId`. Si es null, elimina el registro y devuelve status 200. Si tiene valor, devuelve status 400 con mensaje "Este vehículo está asociado a la operación OP-123. Primero debes desvincularlo desde la edición de la operación".

## Criterios de aceptación

- [ ] El endpoint responde en la ruta DELETE `/api/stock/[id]`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente del vehículo
- [ ] Valida que el vehículo exista antes de intentar eliminar
- [ ] Si el vehículo tiene `operacionId` no null, devuelve status 400 con mensaje descriptivo incluyendo el ID de la operación
- [ ] Si el vehículo tiene `operacionId` null, elimina el registro de la base de datos
- [ ] Devuelve status 200 con mensaje de éxito si la eliminación fue exitosa
- [ ] Devuelve status 404 si el vehículo no existe
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 403 si el vehículo no pertenece al cliente del usuario
- [ ] Devuelve status 500 con mensaje de error si falla la eliminación

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta correctamente si `operacionId` es null o no
- [ ] Si `operacionId` no es null, se construye el mensaje de error con el ID de la operación
- [ ] Si `operacionId` es null, se procede con la eliminación

### Pruebas de integración

- [ ] DELETE `/api/stock/[id]` de un vehículo sin operación asociada devuelve status 200 y elimina el registro
- [ ] DELETE `/api/stock/[id]` de un vehículo con operación asociada devuelve status 400 con mensaje descriptivo
- [ ] El mensaje de error incluye el `idOperacion` de la operación asociada
- [ ] Después de eliminar un vehículo, ya no aparece en GET `/api/stock`
- [ ] DELETE `/api/stock/id-inexistente` devuelve status 404
- [ ] DELETE `/api/stock/[id]` sin autenticación devuelve status 401
- [ ] DELETE `/api/stock/[id]` de un vehículo de otro cliente devuelve status 403
