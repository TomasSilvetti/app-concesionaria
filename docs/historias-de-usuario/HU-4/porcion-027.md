# porcion-027 — Formulario de edición de vehículo — endpoint PUT [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-026
**Tipo:** BACK
**Prerequisitos:** porcion-025
**Estado:** completada

## Descripción

Crear el endpoint PUT `/api/stock/[id]` que reciba los datos actualizados del vehículo via `FormData` (igual que el POST de creación, para soportar fotos), valide los campos obligatorios, y actualice el registro en la base de datos. El endpoint debe permitir editar vehículos incluso si están asociados a una operación.

⚠️ **Diseño de datos actual:** El modelo es `Vehicle` (tabla en BD). Los campos obligatorios son: `marcaId`, `modelo`, `anio`, `categoriaId`, `version`, `color`, `kilometros`, `precioRevista`. El campo `tipoIngreso` fue eliminado del modelo y **no debe procesarse**. El endpoint no debe modificar `operacionId` ni `estado`.

## Ejemplo de uso

Al recibir PUT `/api/stock/abc123` via FormData con `{ marcaId, modelo, anio, categoriaId, version: "1.8 XEi", color: "Azul", kilometros: 52000, precioRevista: 15000, precioOferta: 13500 }`, el endpoint valida los datos, actualiza el registro en la tabla `Vehicle` manteniendo `operacionId` y `estado` existentes, actualiza `actualizadoEn`, y devuelve status 200 con el vehículo actualizado.

## Criterios de aceptación

- [ ] El endpoint responde en la ruta PUT `/api/stock/[id]`
- [ ] Recibe datos via `FormData` (para soportar upload de fotos, consistente con el POST)
- [ ] Requiere autenticación y valida que el vehículo pertenezca al cliente del usuario autenticado
- [ ] Valida que el vehículo exista antes de actualizar
- [ ] Los campos obligatorios son: `marcaId`, `modelo`, `anio`, `categoriaId`, `version`, `color`, `kilometros`, `precioRevista`
- [ ] Los campos opcionales son: `patente`, `notasMecanicas`, `notasGenerales`, `precioOferta`, fotos
- [ ] **No procesa** el campo `tipoIngreso` (fue eliminado del modelo)
- [ ] Mantiene `operacionId` y `estado` sin modificarlos
- [ ] Actualiza el campo `actualizadoEn` con la fecha actual
- [ ] Devuelve status 200 con el vehículo actualizado (incluyendo relaciones VehicleBrand y VehicleCategory)
- [ ] Devuelve status 400 si faltan campos obligatorios o hay errores de validación
- [ ] Devuelve status 404 si el vehículo no existe
- [ ] Devuelve status 401 si no hay autenticación
- [ ] Devuelve status 500 con mensaje de error si falla la actualización

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta cuando falta un campo obligatorio
- [ ] La función de validación acepta datos válidos
- [ ] La función de actualización no modifica `operacionId` ni `estado`
- [ ] El campo `actualizadoEn` se actualiza con la fecha actual

### Pruebas de integración

- [ ] PUT `/api/stock/[id]` con datos válidos devuelve status 200 y actualiza el registro en la BD
- [ ] El `operacionId` y el `estado` del vehículo no cambian después de la actualización
- [ ] PUT `/api/stock/[id]` sin campo obligatorio (ej: sin `marcaId`) devuelve status 400
- [ ] PUT `/api/stock/id-inexistente` devuelve status 404
- [ ] PUT `/api/stock/[id]` sin autenticación devuelve status 401
- [ ] Los cambios se reflejan en el listado GET `/api/stock`
- [ ] Se puede editar un vehículo que tiene `operacionId` no null sin problemas
