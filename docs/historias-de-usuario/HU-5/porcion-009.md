# porcion-009 — Migración: agregar campos de vehículo completos a Operation [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Modificar el schema de Prisma para agregar los campos faltantes del vehículo al modelo `Operation`, de manera que capture la misma información completa que el modelo `Stock`: version, color, kilometros, notasMecanicas, notasGenerales, precioRevista y precioOferta.

## Ejemplo de uso

Al crear una operación, el sistema puede guardar todos los datos del vehículo (versión, color, kilómetros, notas, precios) en la tabla `Operation`, manteniendo consistencia con los datos capturados en el módulo de stock.

## Criterios de aceptación

- [ ] El modelo `Operation` incluye el campo `version` de tipo `String?` (nullable)
- [ ] El modelo `Operation` incluye el campo `color` de tipo `String?` (nullable)
- [ ] El modelo `Operation` incluye el campo `kilometros` de tipo `Int?` (nullable)
- [ ] El modelo `Operation` incluye el campo `notasMecanicas` de tipo `String?` (nullable)
- [ ] El modelo `Operation` incluye el campo `notasGenerales` de tipo `String?` (nullable)
- [ ] El modelo `Operation` incluye el campo `precioRevista` de tipo `Float?` (nullable)
- [ ] El modelo `Operation` incluye el campo `precioOferta` de tipo `Float?` (nullable)
- [ ] La migración se ejecuta exitosamente sin pérdida de datos
- [ ] Los registros existentes de `Operation` mantienen sus datos actuales y los nuevos campos quedan en null

## Pruebas

### Pruebas unitarias

- [ ] Se puede crear un registro de Operation con todos los nuevos campos y se guarda correctamente
- [ ] Se puede crear un registro de Operation sin los nuevos campos (null) y se guarda correctamente
- [ ] La validación de Prisma permite valores null en todos los nuevos campos
- [ ] Los tipos de datos de los nuevos campos coinciden con los del modelo `Stock` para mantener consistencia

### Pruebas de integración

- [ ] Ejecutar la migración en base de datos de desarrollo no genera errores
- [ ] Los registros existentes de Operation mantienen sus valores actuales después de la migración
- [ ] Las queries de Prisma que incluyen los nuevos campos funcionan correctamente con valores null
- [ ] Se pueden insertar valores en los nuevos campos y se recuperan correctamente en las consultas
