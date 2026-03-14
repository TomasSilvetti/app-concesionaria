# porcion-004 — Actualizar endpoint GET /api/stock para filtrar por estado disponible [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Actualizar el endpoint `GET /api/stock` para que consulte la tabla `Vehicle` (en lugar de `Stock`) y filtre únicamente los vehículos con `estado = "disponible"`, de manera que el listado de stock solo muestre vehículos disponibles para la venta.

## Ejemplo de uso

El frontend solicita `GET /api/stock`, el backend consulta `prisma.vehicle.findMany({ where: { clienteId: "...", estado: "disponible" } })` y devuelve únicamente los vehículos disponibles. Los vehículos con estado "en_proceso" o "vendido" no aparecen en el listado.

## Criterios de aceptación

- [ ] El endpoint `GET /api/stock` consulta el modelo `Vehicle` en lugar de `Stock`
- [ ] El endpoint filtra por `estado = "disponible"` en la query de Prisma
- [ ] El endpoint mantiene el filtro por `clienteId` del usuario autenticado
- [ ] El endpoint mantiene todos los includes existentes (VehicleBrand, VehicleCategory, VehiclePhoto)
- [ ] El endpoint responde con código 200 y un array de vehículos disponibles
- [ ] El endpoint requiere autenticación y devuelve 401 si no hay sesión válida
- [ ] El formato de respuesta se mantiene igual que antes (para no romper el frontend temporalmente)
- [ ] Los vehículos con `estado = "en_proceso"` o `estado = "vendido"` NO aparecen en la respuesta

## Pruebas

### Pruebas unitarias

- [ ] La función de consulta incluye el filtro `estado: "disponible"` en el where
- [ ] La función de consulta incluye el filtro por `clienteId` correctamente
- [ ] La función de consulta incluye los includes de relaciones (VehicleBrand, VehicleCategory, VehiclePhoto)
- [ ] La función maneja correctamente el caso de no encontrar vehículos disponibles (devuelve array vacío)

### Pruebas de integración

- [ ] `GET /api/stock` sin autenticación devuelve 401
- [ ] `GET /api/stock` con autenticación válida devuelve 200 y solo vehículos con `estado = "disponible"`
- [ ] Si existen vehículos con `estado = "en_proceso"`, estos NO aparecen en la respuesta
- [ ] Si existen vehículos con `estado = "vendido"`, estos NO aparecen en la respuesta
- [ ] Si no hay vehículos con `estado = "disponible"`, el endpoint devuelve 200 con array vacío
- [ ] Los vehículos devueltos incluyen correctamente las relaciones (marca, categoría, fotos)
- [ ] El endpoint solo devuelve vehículos del cliente autenticado (no de otros clientes)
