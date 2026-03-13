# porcion-006 — Endpoint GET /operations con cursor pagination [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-005
**Tipo:** BACK
**Prerequisitos:** porcion-002

## Descripción

Extender el endpoint GET /operations para implementar paginación por cursor, permitiendo cargar operaciones en lotes. El endpoint acepta parámetros de cursor (último idOperacion visto) y limit (cantidad de resultados) y devuelve el siguiente lote de operaciones junto con información de paginación.

## Ejemplo de uso

El frontend hace GET /operations?limit=20 y recibe las primeras 20 operaciones más un cursor. Cuando el usuario hace scroll, el frontend envía GET /operations?limit=20&cursor=clg1x2y3z4 y el backend devuelve las siguientes 20 operaciones a partir de ese cursor.

## Criterios de aceptación

- [ ] El endpoint acepta el query param "limit" (cantidad de resultados por página, default: 20, máximo: 100)
- [ ] El endpoint acepta el query param "cursor" (idOperacion del último elemento cargado)
- [ ] Si no se proporciona cursor, devuelve los primeros N resultados
- [ ] Si se proporciona cursor, devuelve los siguientes N resultados después de ese cursor
- [ ] La respuesta incluye un campo "nextCursor" con el idOperacion del último elemento devuelto (o null si no hay más)
- [ ] La respuesta incluye un campo "hasMore" (boolean) indicando si hay más resultados
- [ ] La paginación respeta el ordenamiento y filtros aplicados

## Pruebas

### Pruebas unitarias

- [ ] El servicio construye correctamente la query con limit cuando no hay cursor
- [ ] El servicio construye correctamente la query con cursor y limit para obtener los siguientes resultados
- [ ] El servicio calcula correctamente hasMore comparando la cantidad de resultados con el limit
- [ ] El servicio devuelve nextCursor como null cuando no hay más resultados

### Pruebas de integración

- [ ] GET /operations?limit=20 devuelve las primeras 20 operaciones y nextCursor
- [ ] GET /operations?limit=20&cursor=X devuelve las siguientes 20 operaciones después de X
- [ ] Si hay exactamente 20 resultados y no hay más, hasMore es false y nextCursor es null
- [ ] Si hay más de 20 resultados, hasMore es true y nextCursor contiene el idOperacion del último elemento
- [ ] La paginación funciona correctamente con ordenamiento aplicado
- [ ] GET /operations?limit=150 devuelve máximo 100 resultados (límite de seguridad)
