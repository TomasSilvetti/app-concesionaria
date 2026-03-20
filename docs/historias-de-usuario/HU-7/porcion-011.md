# porcion-011 — Endpoint para crear gasto libre (sin operación) [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-010
**Tipo:** BACK
**Estado:** 🔄 En progreso
**Prerequisitos:** porcion-001

## Descripción

Extender el endpoint de creación de gastos (o crear uno nuevo si es necesario) para permitir registrar un gasto sin `operacionId`. Implica hacer el campo `operacion_id` nullable en la tabla `gastos` y validar que el endpoint acepte el body sin ese campo. El gasto queda vinculado únicamente al cliente del usuario autenticado.

## Ejemplo de uso

El modal del Módulo Gastos llama a `POST /api/gastos` con `{ descripcion: "Publicidad", quienPago: "userId123", monto: 500 }` (sin `operacionId`). El servidor crea el gasto sin FK de operación y devuelve el registro creado con `operacionId: null`.

## Criterios de aceptación

- [ ] El campo `operacion_id` en la tabla `gastos` acepta `NULL` (migración para hacer la columna nullable)
- [ ] `POST /api/gastos` acepta el body sin el campo `operacionId` y crea el gasto con `operacion_id = NULL`
- [ ] El endpoint sigue requiriendo los campos obligatorios: `descripcion`, `quienPago` y `monto`
- [ ] El gasto creado queda asociado al `clienteId` del usuario autenticado
- [ ] El endpoint responde con el gasto creado incluyendo `operacionId: null`
- [ ] El endpoint `GET /api/gastos` ya existente devuelve también los gastos con `operacion_id = NULL` dentro del rango de fechas
- [ ] Para los gastos sin operación, el campo `operacionReferencia` en la respuesta de la tabla se devuelve como `null` o string vacío
- [ ] El endpoint verifica el `clienteId` del usuario autenticado antes de crear el gasto

## Pruebas

### Pruebas unitarias

- [ ] El servicio crea correctamente un gasto con `operacionId = null`
- [ ] El servicio rechaza la creación si falta alguno de los campos obligatorios (`descripcion`, `quienPago`, `monto`)

### Pruebas de integración

- [ ] `POST /api/gastos` sin `operacionId` devuelve 201 y el gasto persiste en la base de datos con `operacion_id = NULL`
- [ ] `POST /api/gastos` sin `operacionId` y sin `descripcion` devuelve 400
- [ ] `GET /api/gastos` incluye en su respuesta los gastos con `operacion_id = NULL` y su campo `operacionReferencia` es `null`
