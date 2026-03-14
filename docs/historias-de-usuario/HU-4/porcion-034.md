# porcion-034 — Modal de asociación a operación — endpoint PATCH [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-033
**Tipo:** BACK
**Prerequisitos:** porcion-017, porcion-019

## Descripción

Crear el endpoint PATCH `/api/stock/[id]/asociar` que reciba el ID de una operación y actualice el campo `operacionId` del vehículo, vinculándolo a esa operación. El endpoint debe validar que tanto el vehículo como la operación existan y pertenezcan al mismo cliente.

## Ejemplo de uso

Al recibir PATCH `/api/stock/abc123/asociar` con body `{ operacionId: "op456" }`, el endpoint valida que el vehículo y la operación existan y pertenezcan al mismo cliente, actualiza el campo `operacionId` del vehículo a "op456", actualiza `actualizadoEn`, y devuelve status 200 con el vehículo actualizado.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta PATCH `/api/stock/[id]/asociar`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente
- [ ] Valida que el vehículo exista
- [ ] Valida que la operación exista
- [ ] Valida que el vehículo y la operación pertenezcan al mismo cliente
- [ ] Valida que la operación esté en estado "open" (activa)
- [ ] Actualiza el campo `operacionId` del vehículo con el ID de la operación
- [ ] Actualiza el campo `actualizadoEn` con la fecha actual
- [ ] Devuelve status 200 con el vehículo actualizado
- [ ] Devuelve status 400 si el vehículo y la operación no pertenecen al mismo cliente
- [ ] Devuelve status 400 si la operación no está activa
- [ ] Devuelve status 404 si el vehículo o la operación no existen
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 500 con mensaje de error si falla la actualización

## Pruebas

### Pruebas unitarias

- [ ] La función de validación verifica que el vehículo y la operación existan
- [ ] La función de validación verifica que ambos pertenezcan al mismo cliente
- [ ] La función de validación verifica que la operación esté en estado "open"
- [ ] La actualización solo modifica `operacionId` y `actualizadoEn`

### Pruebas de integración

- [ ] PATCH `/api/stock/[id]/asociar` con datos válidos devuelve status 200 y actualiza el `operacionId`
- [ ] El vehículo actualizado tiene el `operacionId` de la operación seleccionada
- [ ] PATCH con operación de otro cliente devuelve status 400
- [ ] PATCH con operación cerrada devuelve status 400
- [ ] PATCH con vehículo inexistente devuelve status 404
- [ ] PATCH con operación inexistente devuelve status 404
- [ ] PATCH sin autenticación devuelve status 401
- [ ] Después de asociar, GET `/api/stock/[id]` incluye los datos de la operación asociada
