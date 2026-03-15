# porcion-029 — Vista de detalles de vehículo — endpoint GET por ID [BACK]

**Estado:** 🔄 En progreso

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-028
**Tipo:** BACK
**Prerequisitos:** porcion-017
**estado:** completada

## Descripción

Crear el endpoint GET `/api/stock/[id]` que devuelva todos los datos de un vehículo específico del stock, incluyendo relaciones y datos de la operación asociada si existe.

⚠️ **Diseño de datos actual:** El modelo es `Vehicle`. La query de Prisma debe hacer `include` de: `VehicleBrand` (para el nombre de marca), `VehicleCategory` (para el nombre de categoría), `VehiclePhoto` (fotos, solo id/nombreArchivo/orden, sin el campo `datos` en bytes), y `Operation` (si `operacionId` no es null, incluir `idOperacion` y el vehículo vendido via `VehiculoVendido` con su `VehicleBrand`, `modelo` y `patente`). El campo `tipoIngreso` no existe en el modelo.

## Ejemplo de uso

Al recibir GET `/api/stock/abc123`, el endpoint devuelve el vehículo con todos sus campos, su marca (nombre), categoría (nombre), fotos (id y nombre), y si tiene `operacionId`, los datos de la operación con su `idOperacion` y el vehículo vendido (marca, modelo, patente).

## Criterios de aceptación

- [ ] El endpoint responde en la ruta GET `/api/stock/[id]`
- [ ] Requiere autenticación y valida que el vehículo pertenezca al `clienteId` del usuario autenticado
- [ ] Devuelve todos los campos del vehículo: `id`, `marcaId`, `modelo`, `anio`, `categoriaId`, `patente`, `version`, `color`, `kilometros`, `notasMecanicas`, `notasGenerales`, `precioRevista`, `precioOferta`, `estado`, `operacionId`, `creadoEn`, `actualizadoEn`
- [ ] Incluye el nombre de la marca via `VehicleBrand.nombre`
- [ ] Incluye el nombre de la categoría via `VehicleCategory.nombre`
- [ ] Incluye las fotos via `VehiclePhoto` (campos: `id`, `nombreArchivo`, `orden`) ordenadas por `orden asc`. **No incluye el campo `datos`** (bytes) para no saturar la respuesta
- [ ] Si `operacionId` no es null, incluye datos de la operación: `idOperacion`, y del vehículo vendido (`VehiculoVendido`): nombre de marca, `modelo`, `patente`
- [ ] Si `operacionId` es null, devuelve `operacion: null`
- [ ] Devuelve status 200 con el vehículo completo
- [ ] Devuelve status 404 si el vehículo no existe
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 403 si el vehículo no pertenece al cliente del usuario
- [ ] Devuelve status 500 con mensaje de error si falla la consulta

## Pruebas

### Pruebas unitarias

- [ ] La query de Prisma incluye correctamente VehicleBrand, VehicleCategory y VehiclePhoto
- [ ] La query incluye la relación Operation con VehiculoVendido cuando `operacionId` no es null
- [ ] Si `operacionId` es null, la query no falla y devuelve `operacion: null`
- [ ] La validación de permisos verifica que el `clienteId` del vehículo coincide con el del usuario

### Pruebas de integración

- [ ] GET `/api/stock/[id]` con ID válido devuelve status 200 con todos los datos del vehículo
- [ ] La respuesta incluye el nombre de la marca y categoría (no solo los IDs)
- [ ] La respuesta incluye el array de fotos con id y nombreArchivo (sin datos en bytes)
- [ ] Si el vehículo tiene operación asociada, la respuesta incluye `idOperacion` y datos del vehículo vendido
- [ ] Si el vehículo no tiene operación asociada, `operacion: null` en la respuesta
- [ ] GET `/api/stock/id-inexistente` devuelve status 404
- [ ] GET `/api/stock/[id]` sin autenticación devuelve status 401
- [ ] GET `/api/stock/[id]` de un vehículo de otro cliente devuelve status 403
