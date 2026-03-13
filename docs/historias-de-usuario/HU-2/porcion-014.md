# porcion-014 — Endpoint GET /operations/:id — detalle completo [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-013
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear el endpoint GET /operations/:id que devuelve toda la información de una operación específica, incluyendo todas sus relaciones: marca, categoría, tipo de operación, vehículos de intercambio (con sus datos de Stock y OperationExchange) y gastos asociados. Valida que la operación pertenezca al cliente autenticado.

## Ejemplo de uso

El frontend hace GET /operations/clg1x2y3z4 con el token de autenticación. El backend extrae el clienteId del token, busca la operación por id, valida que pertenezca al cliente, incluye todas las relaciones (marca, categoría, tipoOperacion, vehiculosIntercambiados con stock, gastos) y devuelve 200 OK con el objeto completo.

## Criterios de aceptación

- [ ] El endpoint requiere autenticación (token JWT válido)
- [ ] El endpoint busca la operación por idOperacion (parámetro de ruta)
- [ ] El endpoint valida que la operación pertenezca al clienteId del usuario autenticado
- [ ] El endpoint incluye las relaciones: marca, categoria, tipoOperacion
- [ ] El endpoint incluye la relación vehiculosIntercambiados con los datos de Stock (marca, modelo, año, patente, version, color, kilometros, notasMecanicas, notasGenerales) y OperationExchange (precioNegociado)
- [ ] El endpoint incluye la relación gastos con los datos: fecha, descripcion, categoria.nombre, monto
- [ ] Si la operación existe y pertenece al cliente, devuelve 200 OK con el objeto completo
- [ ] Si la operación no existe, devuelve 404 Not Found
- [ ] Si la operación existe pero pertenece a otro cliente, devuelve 404 Not Found (no 403, para no revelar existencia)

## Pruebas

### Pruebas unitarias

- [ ] El servicio busca correctamente la operación por idOperacion
- [ ] El servicio incluye todas las relaciones necesarias en la query de Prisma
- [ ] El servicio valida correctamente que la operación pertenezca al cliente
- [ ] El servicio devuelve null si la operación no existe o no pertenece al cliente

### Pruebas de integración

- [ ] GET /operations/:id sin token devuelve 401 Unauthorized
- [ ] GET /operations/:id con token válido y operación existente del cliente devuelve 200 OK con datos completos
- [ ] GET /operations/:id con id inexistente devuelve 404 Not Found
- [ ] GET /operations/:id con id de operación de otro cliente devuelve 404 Not Found (aislamiento multi-tenant)
- [ ] La respuesta incluye correctamente los datos de marca, categoría y tipoOperacion
- [ ] La respuesta incluye correctamente el array de vehiculosIntercambiados con datos de Stock y precioNegociado
- [ ] La respuesta incluye correctamente el array de gastos asociados
