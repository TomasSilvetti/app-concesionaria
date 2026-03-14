# porcion-002 — Migración: modificar Operation para usar vehiculoVendidoId [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear una migración de Prisma que elimine los campos de vehículo del modelo `Operation` (modelo, anio, patente, version, color, kilometros, notasMecanicas, notasGenerales, precioRevista, precioOferta) y agregue el campo `vehiculoVendidoId` que referencia a la tabla `Vehicle`. Esto elimina la duplicación de datos y establece una relación clara entre operación y vehículo.

## Ejemplo de uso

El desarrollador ejecuta `npx prisma migrate dev --name operation_use_vehicle_reference`, Prisma genera la migración SQL que elimina las columnas del vehículo de la tabla `operation` y agrega la columna `vehiculo_vendido_id` con su foreign key apuntando a `vehicle`. La migración se aplica exitosamente.

## Criterios de aceptación

- [ ] El modelo `Operation` elimina los campos: modelo, anio, patente, version, color, kilometros, notasMecanicas, notasGenerales, precioRevista, precioOferta
- [ ] El modelo `Operation` incluye un campo `vehiculoVendidoId` de tipo `String` obligatorio
- [ ] El modelo `Operation` incluye la relación `VehiculoVendido` que apunta a `Vehicle` usando el campo `vehiculoVendidoId`
- [ ] La relación usa el nombre `"VehiculosVendidos"` para evitar conflictos con otras relaciones futuras
- [ ] La migración SQL generada elimina las columnas correspondientes de la tabla `operation`
- [ ] La migración SQL agrega la columna `vehiculo_vendido_id` con foreign key a `vehicle(id)`
- [ ] La foreign key incluye `onDelete: Cascade` para que al eliminar un vehículo se eliminen sus operaciones asociadas
- [ ] El cliente de Prisma se regenera correctamente con el nuevo modelo `Operation`
- [ ] El modelo `Vehicle` incluye la relación inversa `OperacionesVenta` que apunta a `Operation[]`

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma compila correctamente con el modelo `Operation` modificado
- [ ] El campo `vehiculoVendidoId` es obligatorio (no nullable)
- [ ] La relación `VehiculoVendido` apunta correctamente al modelo `Vehicle`
- [ ] El tipo generado de TypeScript para `Operation` incluye `vehiculoVendidoId` como string
- [ ] El tipo generado de TypeScript para `Operation` NO incluye los campos eliminados del vehículo

### Pruebas de integración

- [ ] Ejecutar `npx prisma migrate dev` genera la migración SQL sin errores
- [ ] La migración se aplica exitosamente en la base de datos de desarrollo
- [ ] Las columnas del vehículo ya no existen en la tabla `operation` después de la migración
- [ ] La columna `vehiculo_vendido_id` existe en la tabla `operation` con foreign key a `vehicle`
- [ ] La foreign key tiene la restricción `ON DELETE CASCADE` configurada
- [ ] Se puede crear una operación con `vehiculoVendidoId` válido y se guarda correctamente
- [ ] Al intentar crear una operación con `vehiculoVendidoId` inválido (vehículo inexistente), la base de datos rechaza la operación
- [ ] Se puede consultar una operación con `include: { VehiculoVendido: true }` y se obtienen todos los datos del vehículo
- [ ] Al eliminar un vehículo que tiene operaciones asociadas, las operaciones se eliminan en cascada
