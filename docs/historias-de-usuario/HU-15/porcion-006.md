# porcion-006 — Suite de integración: Stock [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `stock.integration.test.ts` con los tests de integración para las API routes de stock de vehículos: creación de vehículo, intento de eliminación de un vehículo vinculado a una operación activa (debe devolver 409), y listado de vehículos disponibles.

## Ejemplo de uso

La suite siembra dos vehículos: uno libre y otro vinculado a una operación activa. Verifica que DELETE del vehículo libre funciona, pero DELETE del vehículo vinculado devuelve 409 y el registro permanece en BD.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/stock.integration.test.ts`
- [ ] El `beforeEach` limpia `Vehicle`, `Operation`, `VehicleBrand`, `VehicleCategory` y tablas dependientes, y resiembra los datos necesarios
- [ ] POST `/api/stock` crea el vehículo y en BD el registro tiene el `clienteId` del usuario autenticado
- [ ] DELETE `/api/stock/[id]` de un vehículo vinculado a una operación activa devuelve 409 y el vehículo sigue existiendo en BD
- [ ] DELETE `/api/stock/[id]` de un vehículo libre devuelve 200 o 204 y el registro desaparece de BD
- [ ] GET `/api/stock/disponibles` devuelve solo vehículos con `estado = 'disponible'` del cliente autenticado

## Pruebas

### Pruebas unitarias

- [ ] La condición que determina si un vehículo está "vinculado a una operación activa" puede probarse con lógica pura: vehículo con `operacionId` no nulo y operación con `estado = 'open'`
- [ ] El filtro de `GET /disponibles` excluye correctamente vehículos con `estado = 'vendido'` o `estado = 'reservado'`

### Pruebas de integración

- [ ] POST `/api/stock` → `db.vehicle.findUnique({ where: { id } })` devuelve el vehículo con `clienteId` correcto
- [ ] DELETE vehículo con operación activa → status 409, `db.vehicle.findUnique` sigue devolviendo el registro
- [ ] DELETE vehículo libre → status 200/204, `db.vehicle.findUnique` devuelve `null`
- [ ] GET `/api/stock/disponibles` con dos vehículos (uno disponible, uno vendido) → la respuesta contiene solo el disponible
- [ ] POST `/api/stock` sin token devuelve 401 y no crea ningún registro en BD
