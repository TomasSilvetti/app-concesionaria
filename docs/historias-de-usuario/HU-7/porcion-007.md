# porcion-007 — Endpoints para datos de gráficos [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar los dos endpoints que proveen datos para los gráficos de torta. El primero devuelve el conteo de operaciones por estado (cerradas, canceladas, abiertas) filtrado por período. El segundo devuelve el valor revista y valor real del inventario actual (vehículos disponibles y en operación abierta), sin filtro de período.

## Ejemplo de uso

El gráfico de operaciones llama a `GET /api/gastos/operaciones-por-estado?desde=2026-02-01&hasta=2026-02-28` y recibe `{ cerradas: 8, canceladas: 3, abiertas: 3, total: 14 }`. El gráfico de inventario llama a `GET /api/gastos/inventario` y recibe `{ valorRevista: 9800000, valorReal: 7200000 }`.

## Criterios de aceptación

- [ ] `GET /api/gastos/operaciones-por-estado?desde=...&hasta=...` devuelve `{ cerradas, canceladas, abiertas, total }` para el período dado
- [ ] `abiertas` en el endpoint de operaciones-por-estado cuenta las operaciones abiertas cuya `fechaInicio` cae dentro del período
- [ ] `total` = `cerradas + canceladas + abiertas`
- [ ] `GET /api/gastos/inventario` devuelve `{ valorRevista, valorReal }` ignorando cualquier parámetro de fecha
- [ ] `valorRevista` = `SUM(precioRevista)` de vehículos con `estado = 'disponible'` más vehículos en operaciones con `estado = 'abierta'`
- [ ] `valorReal` = `SUM(precioToma)` del mismo conjunto de vehículos
- [ ] Ambos endpoints verifican `clienteId` del usuario autenticado
- [ ] Si no hay operaciones en el período, `GET /api/gastos/operaciones-por-estado` devuelve todos los conteos en 0

## Pruebas

### Pruebas unitarias

- [ ] El servicio de operaciones-por-estado cuenta correctamente cuando hay mezcla de estados en el período
- [ ] El servicio de inventario incluye vehículos de operaciones abiertas aunque el vehículo no tenga `estado = 'disponible'` directamente
- [ ] El servicio de inventario devuelve `valorRevista: 0` y `valorReal: 0` cuando no hay vehículos en el inventario activo

### Pruebas de integración

- [ ] `GET /api/gastos/operaciones-por-estado` sin `desde`/`hasta` devuelve 400
- [ ] Con 3 operaciones cerradas y 1 cancelada en el período, el endpoint devuelve `{ cerradas: 3, canceladas: 1, ... }`
- [ ] `GET /api/gastos/inventario` con parámetros de fecha adicionales los ignora y devuelve el inventario actual completo
