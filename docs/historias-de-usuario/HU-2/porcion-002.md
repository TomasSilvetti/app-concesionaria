# porcion-002 — Endpoint GET /operations — listado básico [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-001
**Tipo:** BACK
**Prerequisitos:** HU-3 completa
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear el endpoint GET /operations que devuelve el listado de operaciones del cliente autenticado, con aislamiento multi-tenant por clienteId. El endpoint debe incluir las relaciones necesarias (marca, categoría, tipo de operación) y devolver los campos principales para el listado.

## Ejemplo de uso

El frontend hace una petición GET a /api/operations con el token de autenticación. El backend extrae el clienteId del usuario autenticado, consulta las operaciones de ese cliente en la base de datos y devuelve un array con las operaciones incluyendo marca, categoría y tipo de operación.

## Criterios de aceptación

- [ ] El endpoint requiere autenticación (token JWT válido)
- [ ] El endpoint extrae el clienteId del usuario autenticado desde el token
- [ ] El endpoint consulta solo las operaciones del cliente correspondiente (aislamiento multi-tenant)
- [ ] El endpoint devuelve las operaciones con las relaciones: marca, categoría, tipoOperacion
- [ ] El endpoint devuelve los campos: idOperacion, fechaInicio, fechaVenta, modelo, anio, patente, precioVentaTotal, ingresosNetos, estado, marca.nombre, categoria.nombre, tipoOperacion.nombre
- [ ] Si no hay operaciones, devuelve un array vacío
- [ ] Si el token es inválido o no existe, devuelve 401 Unauthorized

## Pruebas

### Pruebas unitarias

- [ ] El servicio de operaciones consulta correctamente las operaciones filtrando por clienteId
- [ ] El servicio incluye las relaciones marca, categoría y tipoOperacion en la query
- [ ] El servicio devuelve un array vacío si no hay operaciones para el cliente

### Pruebas de integración

- [ ] GET /operations sin token devuelve 401 Unauthorized
- [ ] GET /operations con token válido devuelve 200 y un array de operaciones del cliente
- [ ] GET /operations con token de cliente A no devuelve operaciones de cliente B (aislamiento multi-tenant)
- [ ] Las operaciones devueltas incluyen los datos de marca, categoría y tipoOperacion correctamente poblados
