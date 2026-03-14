# porcion-027 — Formulario de edición de vehículo — endpoint PUT [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-026
**Tipo:** BACK
**Prerequisitos:** porcion-025

## Descripción

Crear el endpoint PUT `/api/stock/[id]` que reciba los datos actualizados del vehículo, valide los campos obligatorios, y actualice el registro en la base de datos. El endpoint debe permitir editar vehículos incluso si están asociados a una operación.

## Ejemplo de uso

Al recibir PUT `/api/stock/abc123` con body `{ version: "1.8 XEi", color: "Azul", kilometros: 52000, precioOferta: 13500 }`, el endpoint valida los datos, actualiza el registro en la tabla Stock manteniendo el `operacionId` existente, actualiza `actualizadoEn`, y devuelve status 200 con el vehículo actualizado.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta PUT `/api/stock/[id]`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente del vehículo
- [ ] Valida que el vehículo exista antes de actualizar
- [ ] Valida que los campos obligatorios estén presentes
- [ ] Actualiza solo los campos enviados en el body
- [ ] Mantiene el valor de `operacionId` sin modificarlo (no se puede cambiar la asociación desde aquí)
- [ ] Actualiza el campo `actualizadoEn` con la fecha actual
- [ ] Devuelve status 200 con el vehículo actualizado
- [ ] Devuelve status 400 si faltan campos obligatorios o hay errores de validación
- [ ] Devuelve status 404 si el vehículo no existe
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 500 con mensaje de error si falla la actualización

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta cuando falta un campo obligatorio
- [ ] La función de validación acepta datos válidos
- [ ] La función de actualización no modifica el campo `operacionId`
- [ ] El campo `actualizadoEn` se actualiza con la fecha actual

### Pruebas de integración

- [ ] PUT `/api/stock/[id]` con datos válidos devuelve status 200 y actualiza el registro en la BD
- [ ] El `operacionId` del vehículo no cambia después de la actualización
- [ ] PUT `/api/stock/[id]` sin campo obligatorio devuelve status 400
- [ ] PUT `/api/stock/id-inexistente` devuelve status 404
- [ ] PUT `/api/stock/[id]` sin autenticación devuelve status 401
- [ ] Los cambios se reflejan en el listado GET `/api/stock`
- [ ] Se puede editar un vehículo que tiene `operacionId` no null sin problemas
