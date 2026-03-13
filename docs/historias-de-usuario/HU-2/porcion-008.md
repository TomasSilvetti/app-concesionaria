# porcion-008 — Endpoint GET /operations con query filters [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-007
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Extender el endpoint GET /operations para aceptar parámetros de filtrado: estado, fechaDesde, fechaHasta, marcaId y tipoOperacionId. El endpoint construye la query de Prisma aplicando los filtros proporcionados y devuelve solo las operaciones que cumplen todos los criterios.

## Ejemplo de uso

El frontend envía GET /operations?estado=cerrada&marcaId=clg123. El backend construye una query que filtra operaciones con estado "cerrada" y marcaId "clg123", ejecuta la consulta y devuelve solo las operaciones que cumplen ambos criterios.

## Criterios de aceptación

- [ ] El endpoint acepta el query param "estado" con valores: abierta, cerrada, cancelada
- [ ] El endpoint acepta el query param "fechaDesde" (ISO date string) para filtrar operaciones desde esa fecha
- [ ] El endpoint acepta el query param "fechaHasta" (ISO date string) para filtrar operaciones hasta esa fecha
- [ ] El endpoint acepta el query param "marcaId" para filtrar por marca específica
- [ ] El endpoint acepta el query param "tipoOperacionId" para filtrar por tipo de operación
- [ ] Los filtros se aplican en combinación (AND lógico)
- [ ] Si no se proporciona ningún filtro, devuelve todas las operaciones del cliente
- [ ] El filtrado funciona correctamente en combinación con ordenamiento y paginación

## Pruebas

### Pruebas unitarias

- [ ] El servicio construye correctamente el objeto where de Prisma cuando se proporciona un filtro de estado
- [ ] El servicio construye correctamente el filtro de rango de fechas (gte y lte)
- [ ] El servicio construye correctamente el filtro por marcaId
- [ ] El servicio construye correctamente el filtro por tipoOperacionId
- [ ] El servicio combina múltiples filtros correctamente en un solo objeto where

### Pruebas de integración

- [ ] GET /operations?estado=abierta devuelve solo operaciones con estado "abierta"
- [ ] GET /operations?fechaDesde=2026-01-01 devuelve solo operaciones desde esa fecha
- [ ] GET /operations?fechaDesde=2026-01-01&fechaHasta=2026-03-31 devuelve operaciones en ese rango
- [ ] GET /operations?marcaId=X devuelve solo operaciones de esa marca
- [ ] GET /operations?estado=cerrada&marcaId=X devuelve operaciones que cumplen ambos criterios
- [ ] Los filtros funcionan correctamente con paginación (cursor) y ordenamiento
