# porcion-001 — Migración: renombrar Stock → Vehicle y agregar campo estado [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear una migración de Prisma que renombre el modelo `Stock` a `Vehicle` y agregue un campo `estado` de tipo String con valores posibles "disponible", "en_proceso" y "vendido". Esta migración establece la base para centralizar todos los vehículos en una única tabla.

## Ejemplo de uso

El desarrollador ejecuta `npx prisma migrate dev --name rename_stock_to_vehicle_add_estado`, Prisma genera la migración SQL que renombra la tabla `stock` a `vehicle` y agrega la columna `estado` con valor por defecto "disponible". La migración se aplica exitosamente y todos los registros existentes quedan con `estado = "disponible"`.

## Criterios de aceptación

- [ ] El modelo `Stock` se renombra a `Vehicle` en el archivo `schema.prisma`
- [ ] El modelo `Vehicle` incluye un campo `estado` de tipo `String` con valor por defecto "disponible"
- [ ] El campo `estado` es obligatorio (no nullable)
- [ ] Todas las relaciones que apuntaban a `Stock` ahora apuntan a `Vehicle` (VehicleBrand, VehicleCategory, OperationExchange, VehiclePhoto)
- [ ] La migración SQL generada renombra la tabla `stock` a `vehicle` en la base de datos
- [ ] La migración SQL agrega la columna `estado` con valor por defecto "disponible"
- [ ] Todos los registros existentes en la tabla quedan con `estado = "disponible"` después de la migración
- [ ] Los índices de la tabla se mantienen correctamente después del renombrado
- [ ] El cliente de Prisma se regenera correctamente con el nuevo modelo `Vehicle`

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma compila correctamente con el modelo `Vehicle` y el campo `estado`
- [ ] El campo `estado` tiene el valor por defecto "disponible" configurado correctamente
- [ ] Todas las relaciones del modelo `Vehicle` apuntan a los modelos correctos
- [ ] El tipo generado de TypeScript para `Vehicle` incluye el campo `estado` como string

### Pruebas de integración

- [ ] Ejecutar `npx prisma migrate dev` genera la migración SQL sin errores
- [ ] La migración se aplica exitosamente en la base de datos de desarrollo
- [ ] La tabla `vehicle` existe en la base de datos después de la migración
- [ ] La tabla `stock` ya no existe en la base de datos después de la migración
- [ ] La columna `estado` existe en la tabla `vehicle` con tipo varchar
- [ ] Todos los registros existentes tienen `estado = "disponible"` después de la migración
- [ ] Las foreign keys que apuntaban a `stock` ahora apuntan a `vehicle` correctamente
- [ ] Se puede crear un nuevo registro en `Vehicle` con `estado = "en_proceso"` sin errores
- [ ] Se puede consultar registros de `Vehicle` filtrando por `estado` correctamente
