# porcion-023 — Filtros de stock — aplicación de filtros en endpoint [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-022
**Tipo:** BACK
**Prerequisitos:** porcion-019
**estado:** ✅ Completada

## Descripción

Implementar la lógica de filtrado en el endpoint GET `/api/stock` para que acepte múltiples parámetros de filtro y construya dinámicamente la query de Prisma con las condiciones `where` correspondientes. Los filtros deben ser acumulativos (AND) y opcionales.

## Ejemplo de uso

Al recibir GET `/api/stock?clienteId=abc&marca=Toyota&precioMin=10000&precioMax=50000&tipoIngreso=Compra`, el endpoint construye una query de Prisma con múltiples condiciones where y devuelve solo los vehículos que cumplen todos los criterios.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros de filtro: `marca`, `categoria`, `precioMin`, `precioMax`, `anio`, `kilometrosMax`, `tipoIngreso`
- [ ] Todos los filtros son opcionales y se aplican solo si están presentes en la query
- [ ] Los filtros se combinan con lógica AND (deben cumplirse todos los especificados)
- [ ] El filtro de marca busca por ID de marca en la operación asociada
- [ ] El filtro de categoría busca por ID de categoría en la operación asociada
- [ ] Los filtros de rango de precio aplican a `precioRevista` o `precioOferta`
- [ ] Los filtros funcionan correctamente en combinación con el ordenamiento

## Pruebas

### Pruebas unitarias

- [ ] La función de construcción de filtros crea correctamente el objeto `where` de Prisma
- [ ] Si no hay filtros, el objeto `where` solo incluye `clienteId`
- [ ] Los filtros de rango numérico usan correctamente `gte` (mayor o igual) y `lte` (menor o igual)
- [ ] Los filtros de texto usan búsqueda exacta por ID

### Pruebas de integración

- [ ] GET `/api/stock?clienteId=test&marca=Toyota` devuelve solo vehículos de marca Toyota
- [ ] GET `/api/stock?clienteId=test&precioMin=10000` devuelve solo vehículos con precio >= 10000
- [ ] GET `/api/stock?clienteId=test&precioMax=50000` devuelve solo vehículos con precio <= 50000
- [ ] GET `/api/stock?clienteId=test&kilometrosMax=50000` devuelve solo vehículos con kilómetros <= 50000
- [ ] GET `/api/stock?clienteId=test&tipoIngreso=Compra` devuelve solo vehículos con tipo de ingreso "Compra"
- [ ] GET `/api/stock?clienteId=test&marca=Toyota&precioMin=10000&precioMax=50000` devuelve solo vehículos que cumplen todos los criterios
- [ ] Los filtros no afectan vehículos de otros clientes
