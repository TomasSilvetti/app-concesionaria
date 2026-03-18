# porcion-009 — Endpoint de tabla de gastos filtrada [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-008
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar el endpoint que devuelve todos los gastos del cliente con soporte de filtros: período (desde/hasta), operación (por ID) y quién pagó (por userId o "dueno_auto"). Devuelve cada gasto con los datos necesarios para la tabla: ID de operación, descripción, nombre resuelto de quién pagó, monto y fecha.

## Ejemplo de uso

La tabla de porcion-008 llama a `GET /api/gastos?desde=2026-02-01&hasta=2026-02-28&quienPago=dueno_auto` y recibe la lista de gastos filtrada con todos los campos necesarios para renderizar cada fila.

## Criterios de aceptación

- [ ] `GET /api/gastos` devuelve todos los gastos del cliente paginados o sin paginar (a definir con el equipo), con los campos: `id`, `operacionId`, `operacionReferencia`, `descripcion`, `quienPagoNombre`, `monto`, `fecha`
- [ ] El parámetro `desde`/`hasta` filtra por la `fecha` del gasto (no por la fecha de la operación)
- [ ] El parámetro `operacionId` filtra por operación específica
- [ ] El parámetro `quienPago` acepta un `userId` (para filtrar por usuario) o el valor `"dueno_auto"`
- [ ] El campo `quienPagoNombre` devuelve el nombre del usuario si es un usuario, o "Dueño del auto" si es el valor especial
- [ ] Si no se pasan `desde`/`hasta`, el endpoint los infiere con el último mes como valor por defecto
- [ ] El endpoint verifica el `clienteId` del usuario autenticado
- [ ] Si no hay resultados para los filtros dados, devuelve una lista vacía (no un error)

## Pruebas

### Pruebas unitarias

- [ ] El servicio filtra correctamente por `quienPago = "dueno_auto"` devolviendo solo los gastos con `quienPagoEspecial = "dueno_auto"`
- [ ] El servicio resuelve el nombre de quién pagó: si es usuario devuelve `user.nombre`, si es "dueno_auto" devuelve el string "Dueño del auto"
- [ ] Cuando no se pasan `desde`/`hasta`, el servicio aplica el rango del último mes por defecto

### Pruebas de integración

- [ ] `GET /api/gastos?desde=...&hasta=...` devuelve únicamente gastos cuya `fecha` cae dentro del rango
- [ ] `GET /api/gastos?operacionId=X` devuelve solo los gastos asociados a esa operación
- [ ] Con los tres filtros activos simultáneamente, el endpoint aplica todos correctamente y devuelve solo los gastos que cumplen los tres criterios
