# porcion-003 — Suite de integración: Operaciones [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Crear el archivo `operations.integration.test.ts` con todos los tests de integración para las API routes de operaciones: creación, listado, actualización y los recálculos automáticos de `ingresosNetos` y `comision` que dispara un PATCH.

## Ejemplo de uso

Al correr `npm run test:integration`, esta suite siembra un cliente y un usuario de test, ejecuta requests reales a `/api/operations`, y verifica tanto el status HTTP como el estado de la BD después de cada operación.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/operations.integration.test.ts`
- [ ] El `beforeEach` limpia las tablas `Operation`, `Vehicle`, `VehicleBrand`, `VehicleCategory`, `User`, `Client` (en orden que respeta foreign keys) y las resiembra con datos mínimos
- [ ] POST `/api/operations` con datos válidos devuelve 201 y el body contiene los campos de la operación creada
- [ ] POST `/api/operations` con `tipoOperacion` inválido devuelve 400
- [ ] POST `/api/operations` sin token de sesión devuelve 401
- [ ] GET `/api/operations` autenticado devuelve solo las operaciones del `clienteId` del usuario (no las de otro cliente)
- [ ] PATCH `/api/operations/[id]` al cambiar `precioVentaTotal` verifica en la BD que `ingresosNetos` y `comision` fueron recalculados con los valores correctos
- [ ] PATCH `/api/operations/[id]` con un `id` de otro cliente devuelve 403 o 404

## Pruebas

### Pruebas unitarias

- [ ] La función de limpieza del `beforeEach` elimina registros en el orden correcto sin violar foreign keys (puede testearse aislando solo la lógica de cleanup)
- [ ] Los valores esperados de `ingresosNetos` y `comision` en el test de recálculo coinciden con la fórmula de negocio definida en la app

### Pruebas de integración

- [ ] POST `/api/operations` → 201: el registro aparece en `db.operation.findUnique` con todos los campos correctos
- [ ] GET `/api/operations` con dos clientes sembrados: la respuesta solo contiene operaciones del cliente autenticado
- [ ] PATCH recalcula correctamente: después del request, `db.operation.findUnique` devuelve los nuevos valores de `ingresosNetos` y `comision`
- [ ] PATCH con id de otro cliente: la operación del cliente B permanece intacta en la BD (no fue modificada)
- [ ] POST sin token: el middleware rechaza antes de llegar al handler (no se crea ningún registro en BD)
