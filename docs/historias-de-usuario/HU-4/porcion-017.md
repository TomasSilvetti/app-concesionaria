# porcion-017 — Migración: hacer nullable operacionId en Stock [BACK]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada

## Descripción

Modificar el schema de Prisma para que el campo `operacionId` en la tabla `Stock` sea opcional (nullable), permitiendo que los vehículos del stock existan de forma independiente sin estar asociados a una operación.

## Ejemplo de uso

Un vehículo puede ser agregado al stock sin necesidad de tener una operación asociada. El campo `operacionId` puede ser `null` hasta que el vehículo sea vinculado a una operación de venta.

## Criterios de aceptación

- [ ] El campo `operacionId` en el modelo `Stock` es de tipo `String?` (nullable)
- [ ] La migración se ejecuta exitosamente sin pérdida de datos
- [ ] Los vehículos existentes mantienen su asociación con operaciones
- [ ] Es posible crear nuevos registros de Stock con `operacionId` null
- [ ] La relación con `Operation` sigue funcionando correctamente cuando `operacionId` tiene valor

## Pruebas

### Pruebas unitarias

- [ ] Se puede crear un registro de Stock con `operacionId` null y se guarda correctamente en la base de datos
- [ ] Se puede crear un registro de Stock con `operacionId` con valor y se guarda correctamente
- [ ] La validación de Prisma permite valores null en `operacionId`

### Pruebas de integración

- [ ] Ejecutar la migración en base de datos de desarrollo no genera errores
- [ ] Los registros existentes de Stock mantienen sus valores de `operacionId` después de la migración
- [ ] Las queries de Prisma que incluyen `operacionId` funcionan correctamente con valores null
- [ ] La relación `Stock.Operation` devuelve null cuando `operacionId` es null
