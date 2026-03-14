# porcion-029 — Vista de detalles de vehículo — endpoint GET por ID [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-028
**Tipo:** BACK
**Prerequisitos:** porcion-017

## Descripción

Crear el endpoint GET `/api/stock/[id]` que devuelva todos los datos de un vehículo específico del stock, incluyendo los datos de la operación asociada si existe. El endpoint debe validar que el vehículo pertenezca al cliente del usuario autenticado.

## Ejemplo de uso

Al recibir GET `/api/stock/abc123`, el endpoint busca el vehículo con ese ID, incluye los datos de la operación asociada si `operacionId` no es null, y devuelve status 200 con todos los datos del vehículo.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta GET `/api/stock/[id]`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente del vehículo
- [ ] Devuelve todos los campos del vehículo
- [ ] Si el vehículo tiene `operacionId`, incluye los datos de la operación asociada (idOperacion, marca, modelo, patente)
- [ ] Si el vehículo no tiene `operacionId`, devuelve `operacion: null`
- [ ] Devuelve status 200 con el vehículo completo
- [ ] Devuelve status 404 si el vehículo no existe
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 403 si el vehículo no pertenece al cliente del usuario
- [ ] Devuelve status 500 con mensaje de error si falla la consulta

## Pruebas

### Pruebas unitarias

- [ ] La query de Prisma incluye correctamente los datos de la operación asociada
- [ ] Si `operacionId` es null, la query no falla y devuelve `operacion: null`
- [ ] La validación de permisos verifica que el vehículo pertenezca al cliente del usuario

### Pruebas de integración

- [ ] GET `/api/stock/[id]` con ID válido devuelve status 200 con todos los datos del vehículo
- [ ] Si el vehículo tiene operación asociada, los datos de la operación se incluyen en la respuesta
- [ ] Si el vehículo no tiene operación asociada, `operacion: null` en la respuesta
- [ ] GET `/api/stock/id-inexistente` devuelve status 404
- [ ] GET `/api/stock/[id]` sin autenticación devuelve status 401
- [ ] GET `/api/stock/[id]` de un vehículo de otro cliente devuelve status 403
