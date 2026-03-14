# porcion-006 — Actualizar endpoint GET /api/operations para incluir datos de Vehicle [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Actualizar el endpoint `GET /api/operations` para que incluya los datos del vehículo vendido mediante un JOIN con la tabla `Vehicle` usando la relación `VehiculoVendido`, en lugar de leer los campos del vehículo directamente de la tabla `Operation`.

## Ejemplo de uso

El frontend solicita `GET /api/operations`, el backend consulta `prisma.operation.findMany({ include: { VehiculoVendido: { include: { VehicleBrand: true, VehicleCategory: true, VehiclePhoto: true } } } })` y devuelve las operaciones con todos los datos del vehículo anidados en el objeto `VehiculoVendido`. El frontend accede a los datos como `operacion.VehiculoVendido.modelo` en lugar de `operacion.modelo`.

## Criterios de aceptación

- [ ] El endpoint `GET /api/operations` incluye la relación `VehiculoVendido` en el include de Prisma
- [ ] El include de `VehiculoVendido` también incluye sus relaciones: `VehicleBrand`, `VehicleCategory` y `VehiclePhoto`
- [ ] El endpoint mantiene el filtro por `clienteId` del usuario autenticado
- [ ] El endpoint mantiene todos los otros includes existentes (OperationType, OperationExchange, etc.)
- [ ] El endpoint responde con código 200 y un array de operaciones con datos del vehículo anidados
- [ ] El endpoint requiere autenticación y devuelve 401 si no hay sesión válida
- [ ] La respuesta incluye todos los campos del vehículo dentro del objeto `VehiculoVendido`
- [ ] Si una operación no tiene vehículo asociado (datos inconsistentes), el endpoint no falla pero `VehiculoVendido` es null

## Pruebas

### Pruebas unitarias

- [ ] La función de consulta incluye `VehiculoVendido` en el include de Prisma
- [ ] La función de consulta incluye las relaciones anidadas del vehículo (marca, categoría, fotos)
- [ ] La función de consulta filtra correctamente por `clienteId`
- [ ] La función maneja correctamente el caso de operaciones sin vehículo asociado

### Pruebas de integración

- [ ] `GET /api/operations` sin autenticación devuelve 401
- [ ] `GET /api/operations` con autenticación válida devuelve 200 y operaciones con datos del vehículo
- [ ] Cada operación en la respuesta tiene un objeto `VehiculoVendido` con todos los campos del vehículo
- [ ] El objeto `VehiculoVendido` incluye `VehicleBrand`, `VehicleCategory` y `VehiclePhoto` correctamente
- [ ] Los datos del vehículo (modelo, año, patente, color, etc.) están dentro de `VehiculoVendido`, no en la raíz de `Operation`
- [ ] El endpoint solo devuelve operaciones del cliente autenticado (no de otros clientes)
- [ ] Si hay operaciones con vehículos en diferentes estados, todas se devuelven correctamente (el filtro de estado solo aplica en /api/stock)
