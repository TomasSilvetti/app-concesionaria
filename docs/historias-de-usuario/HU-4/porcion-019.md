# porcion-019 — Listado de stock — endpoint GET con filtros y ordenamiento [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-018
**Tipo:** BACK
**Prerequisitos:** porcion-017

## Descripción

Crear el endpoint GET `/api/stock` que devuelva todos los vehículos del stock del cliente autenticado, con soporte para filtros (marca, categoría, rango de precio, año, kilómetros, tipo de ingreso) y ordenamiento por cualquier columna. El endpoint debe incluir datos de la operación asociada (marca, modelo) si existe.

## Ejemplo de uso

Al hacer GET a `/api/stock?clienteId=abc123&orderBy=marca&order=asc&precioMin=10000&precioMax=50000`, el endpoint devuelve un array de vehículos filtrados por rango de precio y ordenados por marca ascendente.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta GET `/api/stock`
- [ ] Requiere autenticación y valida que el usuario tenga acceso al cliente
- [ ] Devuelve todos los vehículos del stock del cliente especificado
- [ ] Incluye los datos de la operación asociada (idOperacion, marca, modelo) si `operacionId` no es null
- [ ] Soporta parámetros de query para filtros: `marca`, `categoria`, `precioMin`, `precioMax`, `anio`, `kilometrosMax`, `tipoIngreso`
- [ ] Soporta parámetros de query para ordenamiento: `orderBy` (nombre de columna) y `order` (asc/desc)
- [ ] Devuelve status 200 con array de vehículos
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 500 con mensaje de error si falla la consulta

## Pruebas

### Pruebas unitarias

- [ ] La función de filtrado por marca devuelve solo vehículos de la marca especificada
- [ ] La función de filtrado por rango de precio devuelve solo vehículos dentro del rango
- [ ] La función de ordenamiento ordena correctamente por la columna especificada
- [ ] La query de Prisma incluye correctamente los datos de la operación asociada

### Pruebas de integración

- [ ] GET `/api/stock?clienteId=test` devuelve status 200 con array de vehículos del cliente
- [ ] GET `/api/stock?clienteId=test&marca=Toyota` devuelve solo vehículos Toyota
- [ ] GET `/api/stock?clienteId=test&precioMin=10000&precioMax=50000` devuelve solo vehículos en ese rango
- [ ] GET `/api/stock?clienteId=test&orderBy=marca&order=asc` devuelve vehículos ordenados por marca ascendente
- [ ] GET `/api/stock` sin autenticación devuelve status 401
- [ ] Los vehículos con `operacionId` null se devuelven correctamente sin datos de operación
- [ ] Los vehículos con `operacionId` incluyen los datos de la operación asociada
