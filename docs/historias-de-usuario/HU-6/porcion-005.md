# porcion-005 — Actualizar endpoint POST /api/stock para crear Vehicle con estado disponible [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-
**estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Actualizar el endpoint `POST /api/stock` para que cree registros en la tabla `Vehicle` (en lugar de `Stock`) con `estado = "disponible"`, de manera que los vehículos cargados desde el módulo de stock queden automáticamente disponibles para la venta.

## Ejemplo de uso

El frontend envía `POST /api/stock` con los datos del vehículo (marca, modelo, año, patente, etc.), el backend crea un registro en `Vehicle` con todos esos datos y `estado = "disponible"`. El vehículo creado aparece inmediatamente en el listado de stock disponible.

## Criterios de aceptación

- [ ] El endpoint `POST /api/stock` crea registros en el modelo `Vehicle` en lugar de `Stock`
- [ ] El endpoint asigna automáticamente `estado = "disponible"` al crear el vehículo
- [ ] El endpoint mantiene todas las validaciones existentes de campos obligatorios
- [ ] El endpoint mantiene el procesamiento de fotos y las guarda en `VehiclePhoto`
- [ ] El endpoint responde con código 201 y los datos del vehículo creado en caso de éxito
- [ ] El endpoint responde con código 400 y mensaje descriptivo en caso de datos inválidos
- [ ] El endpoint requiere autenticación y devuelve 401 si no hay sesión válida
- [ ] El vehículo creado se asocia al `clienteId` del usuario autenticado
- [ ] El campo `operacionId` del vehículo queda en `null` (no está asociado a ninguna operación)

## Pruebas

### Pruebas unitarias

- [ ] La función de creación asigna correctamente `estado = "disponible"` al vehículo
- [ ] La función de creación valida correctamente los campos obligatorios del vehículo
- [ ] La función de creación genera un ID único para el vehículo
- [ ] La función de creación asocia el vehículo al `clienteId` correcto
- [ ] La función de creación deja `operacionId` en `null`

### Pruebas de integración

- [ ] `POST /api/stock` sin autenticación devuelve 401
- [ ] `POST /api/stock` con datos válidos devuelve 201 y crea el vehículo en la tabla `vehicle`
- [ ] El vehículo creado tiene `estado = "disponible"` en la base de datos
- [ ] El vehículo creado tiene `operacionId = null` en la base de datos
- [ ] El vehículo creado aparece en el listado de `GET /api/stock` inmediatamente
- [ ] `POST /api/stock` con campos obligatorios faltantes devuelve 400 con mensaje descriptivo
- [ ] Las fotos enviadas se guardan correctamente en `VehiclePhoto` asociadas al vehículo creado
- [ ] El vehículo creado solo es accesible por el cliente que lo creó (no por otros clientes)
