# porcion-007 — Actualizar endpoint POST /api/operations para crear Vehicle primero [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-002, porcion-003
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Actualizar el endpoint `POST /api/operations` para que cree primero un registro en `Vehicle` con todos los datos del vehículo y `estado = "en_proceso"`, procese y guarde las fotos en `VehiclePhoto`, y luego cree el registro de `Operation` con `vehiculoVendidoId` apuntando al vehículo creado. Todo debe ejecutarse en una transacción para garantizar consistencia.

## Ejemplo de uso

El frontend envía `POST /api/operations` con los datos del vehículo y la operación. El backend:
1. Crea el vehículo en `Vehicle` con `estado = "en_proceso"`
2. Guarda las fotos en `VehiclePhoto` asociadas al vehículo
3. Crea la operación en `Operation` con `vehiculoVendidoId` apuntando al vehículo
4. Responde con código 201 y los datos de la operación (incluyendo el vehículo mediante include)

Si algo falla, toda la transacción se revierte.

## Criterios de aceptación

- [ ] El endpoint crea primero un registro en `Vehicle` con todos los datos del vehículo recibidos
- [ ] El vehículo se crea con `estado = "en_proceso"` automáticamente
- [ ] El endpoint procesa las fotos del vehículo y las guarda en `VehiclePhoto` asociadas al vehículo creado
- [ ] El endpoint crea luego el registro de `Operation` con `vehiculoVendidoId` apuntando al vehículo creado
- [ ] Toda la operación (Vehicle + VehiclePhoto + Operation) se ejecuta dentro de una transacción de Prisma
- [ ] Si falla cualquier paso, toda la transacción se revierte (rollback) y no se guarda nada
- [ ] El endpoint mantiene todas las validaciones existentes de campos obligatorios
- [ ] El endpoint mantiene el cálculo automático de comisión e ingresos netos
- [ ] El endpoint responde con código 201 y los datos de la operación creada (incluyendo `VehiculoVendido`)
- [ ] El endpoint responde con código 400 y mensaje descriptivo en caso de datos inválidos
- [ ] El endpoint requiere autenticación y devuelve 401 si no hay sesión válida
- [ ] El vehículo creado NO aparece en el listado de stock disponible (porque su estado es "en_proceso")

## Pruebas

### Pruebas unitarias

- [ ] La función de creación de vehículo asigna correctamente `estado = "en_proceso"`
- [ ] La función de creación de operación incluye el `vehiculoVendidoId` correcto
- [ ] La función de validación detecta cuando faltan campos obligatorios del vehículo
- [ ] La función de validación detecta cuando faltan campos obligatorios de la operación
- [ ] La función de cálculo de comisión e ingresos netos funciona correctamente
- [ ] La función de procesamiento de fotos asocia correctamente cada foto al vehículo

### Pruebas de integración

- [ ] `POST /api/operations` sin autenticación devuelve 401
- [ ] `POST /api/operations` con datos válidos crea el vehículo, las fotos y la operación correctamente
- [ ] El vehículo creado tiene `estado = "en_proceso"` en la base de datos
- [ ] La operación creada tiene `vehiculoVendidoId` apuntando al vehículo creado
- [ ] Las fotos se guardan en `VehiclePhoto` asociadas al vehículo (no a la operación)
- [ ] Si falla la creación del vehículo, no se crea la operación (rollback)
- [ ] Si falla la creación de la operación, el vehículo tampoco queda guardado (rollback)
- [ ] El vehículo con `estado = "en_proceso"` NO aparece en `GET /api/stock`
- [ ] Al consultar la operación creada con include, se obtienen todos los datos del vehículo
- [ ] `POST /api/operations` con campos obligatorios faltantes devuelve 400 con mensaje descriptivo
