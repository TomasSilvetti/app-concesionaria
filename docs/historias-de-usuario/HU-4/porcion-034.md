# porcion-034 — Endpoint GET vehículos disponibles en stock [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-033
**Tipo:** BACK
**Estado:** ✅ Completada
**Prerequisitos:** porcion-017, porcion-019

## Descripción

Crear el endpoint GET `/api/stock/disponibles` que devuelve todos los vehículos del stock sin operación asociada (campo `operacionId` nulo) pertenecientes al cliente del usuario autenticado. Este endpoint es consumido por el modal "Buscar en stock" del formulario de operación.

## Ejemplo de uso

Al recibir GET `/api/stock/disponibles`, el endpoint autentica al usuario, obtiene su `clienteId`, consulta todos los vehículos del stock donde `operacionId` sea nulo y `clienteId` coincida, y devuelve el array con los campos relevantes: id, marca, modelo, patente, color, km, precioRevista, precioOferta.

## Criterios de aceptación

- [x] El endpoint responde en la ruta GET `/api/stock/disponibles`
- [x] Requiere autenticación y valida que el usuario tenga acceso al cliente
- [x] Solo devuelve vehículos donde `operacionId` sea nulo (no asociados a ninguna operación)
- [x] Solo devuelve vehículos del cliente del usuario autenticado
- [x] La respuesta incluye para cada vehículo: id, marca (resuelta desde VehicleBrand), modelo, patente, color, km, precioRevista, precioOferta
- [x] Devuelve status 200 con el array de vehículos (puede ser vacío)
- [x] Devuelve status 401 si no hay autenticación
- [x] Devuelve status 500 con mensaje de error si falla la consulta

## Pruebas

### Pruebas unitarias

- [x] La función de consulta filtra correctamente por `operacionId` nulo y `clienteId`
- [x] La respuesta incluye el campo `marca` resuelto desde la relación `VehicleBrand.nombre`

### Pruebas de integración

- [x] GET `/api/stock/disponibles` autenticado devuelve status 200
- [x] La respuesta solo contiene vehículos sin `operacionId`
- [x] No aparecen vehículos de otros clientes en la respuesta
- [x] Si todos los vehículos están asociados a operaciones, devuelve un array vacío
- [x] GET sin autenticación devuelve status 401
- [x] Al asociar un vehículo a una operación, ya no aparece en este endpoint
