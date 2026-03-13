# porcion-004 — Lógica de ordenamiento de columnas en backend [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-003
**Tipo:** BACK
**Prerequisitos:** porcion-002

## Descripción

Extender el endpoint GET /operations para aceptar parámetros de ordenamiento (sortBy y sortOrder) que permitan ordenar el listado por cualquier columna. El ordenamiento debe funcionar con campos directos de la operación y con campos de relaciones (marca, categoría).

## Ejemplo de uso

El frontend envía GET /operations?sortBy=fechaInicio&sortOrder=desc. El backend ordena las operaciones por fecha de inicio descendente (más reciente primero) y las devuelve. Si el usuario hace clic nuevamente, envía sortOrder=asc y el backend invierte el orden.

## Criterios de aceptación

- [ ] El endpoint acepta el query param "sortBy" con valores: fechaInicio, fechaVenta, modelo, anio, marca, estado, precioVentaTotal, ingresosNetos
- [ ] El endpoint acepta el query param "sortOrder" con valores: asc, desc
- [ ] Si no se especifica sortBy, ordena por fechaInicio desc por defecto
- [ ] El ordenamiento por "marca" ordena por marca.nombre alfabéticamente
- [ ] El ordenamiento funciona correctamente con valores nulos (ej: fechaVenta puede ser null)
- [ ] Si sortBy es inválido, devuelve 400 Bad Request con mensaje de error

## Pruebas

### Pruebas unitarias

- [ ] El servicio construye correctamente la query de ordenamiento para campos directos (fechaInicio, modelo, etc.)
- [ ] El servicio construye correctamente la query de ordenamiento para campos relacionados (marca.nombre)
- [ ] El servicio aplica el orden por defecto (fechaInicio desc) cuando no se especifican parámetros
- [ ] El servicio valida que sortBy sea un campo permitido

### Pruebas de integración

- [ ] GET /operations?sortBy=fechaInicio&sortOrder=asc devuelve operaciones ordenadas de más vieja a más nueva
- [ ] GET /operations?sortBy=fechaInicio&sortOrder=desc devuelve operaciones ordenadas de más nueva a más vieja
- [ ] GET /operations?sortBy=marca&sortOrder=asc ordena alfabéticamente por nombre de marca
- [ ] GET /operations?sortBy=precioVentaTotal&sortOrder=desc ordena por precio de mayor a menor
- [ ] GET /operations?sortBy=campoInvalido devuelve 400 Bad Request
