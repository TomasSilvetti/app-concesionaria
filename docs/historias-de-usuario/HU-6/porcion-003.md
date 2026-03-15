# porcion-003 — Migración: eliminar modelo OperationPhoto [BACK]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear una migración de Prisma que elimine el modelo `OperationPhoto` del schema, ya que las fotos de los vehículos que se venden ahora se guardarán en `VehiclePhoto` asociadas al registro del vehículo en la tabla `Vehicle`.

## Ejemplo de uso

El desarrollador ejecuta `npx prisma migrate dev --name remove_operation_photo`, Prisma genera la migración SQL que elimina la tabla `operation_photo` de la base de datos. La migración se aplica exitosamente y el modelo desaparece del schema.

## Criterios de aceptación

- [ ] El modelo `OperationPhoto` se elimina completamente del archivo `schema.prisma`
- [ ] El modelo `Operation` elimina la relación `OperationPhoto` de su lista de relaciones
- [ ] La migración SQL generada incluye `DROP TABLE operation_photo`
- [ ] La migración se ejecuta exitosamente sin errores
- [ ] El cliente de Prisma se regenera correctamente sin el modelo `OperationPhoto`
- [ ] Los tipos de TypeScript generados ya no incluyen `OperationPhoto`

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma compila correctamente sin el modelo `OperationPhoto`
- [ ] El modelo `Operation` no tiene la relación `OperationPhoto` en su definición
- [ ] El tipo generado de TypeScript para `Operation` no incluye `OperationPhoto` en sus relaciones

### Pruebas de integración

- [ ] Ejecutar `npx prisma migrate dev` genera la migración SQL sin errores
- [ ] La migración se aplica exitosamente en la base de datos de desarrollo
- [ ] La tabla `operation_photo` ya no existe en la base de datos después de la migración
- [ ] No quedan foreign keys huérfanas apuntando a la tabla eliminada
- [ ] El cliente de Prisma funciona correctamente sin intentar acceder a `OperationPhoto`
- [ ] Las queries que antes incluían `OperationPhoto` ahora fallan con error claro de TypeScript (esperado)
