# porcion-001 — Migración de BD: modelos Inversor, Inversion e InversionParticipante [BACK]

**Historia de usuario:** HU-18: Inversores en operaciones
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-07-01

## Descripción

Crear las tres tablas necesarias para registrar inversiones en operaciones: `Inversor` (personas externas que pueden invertir), `Inversion` (una por operación) e `InversionParticipante` (cada participante con su monto, porcentaje de aporte y porcentaje de utilidad acordado).

## Ejemplo de uso

Una operación tiene una inversión registrada con dos participantes: la concesionaria y un inversor llamado "Juan Pérez". Cada uno tiene su monto de aporte, el porcentaje de participación calculado, y opcionalmente el porcentaje de utilidad acordado.

## Criterios de aceptación

- [ ] Se crea el modelo `Inversor` con campos: `id`, `clienteId`, `nombre`, `creadoEn`
- [ ] Se crea el modelo `Inversion` con campos: `id`, `operacionId` (único, una inversión por operación), `clienteId`, `creadoEn`, `actualizadoEn`
- [ ] Se crea el modelo `InversionParticipante` con campos: `id`, `inversionId`, `inversorId` (nullable), `esConcecionaria` (Boolean), `montoAporte` (Float), `porcentajeParticipacion` (Float), `porcentajeUtilidad` (Float, nullable), `creadoEn`, `actualizadoEn`
- [ ] `Inversor` tiene relación con `Client` (clienteId) y con `InversionParticipante`
- [ ] `Inversion` tiene relación con `Operation` (onDelete: Cascade) y con `InversionParticipante`
- [ ] `InversionParticipante` tiene relación con `Inversion` (onDelete: Cascade) y con `Inversor` (nullable)
- [ ] La migración se aplica correctamente sin errores en la base de datos existente

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma valida sin errores (`prisma validate`)
- [ ] La migración se genera sin conflictos con las tablas existentes (`prisma migrate dev --create-only`)
- [ ] Un `InversionParticipante` puede tener `inversorId` null cuando `esConcecionaria` es true
- [ ] No se pueden crear dos `Inversion` para la misma `operacionId` (restricción unique)

### Pruebas de integración

- [ ] Se puede crear una `Inversion` asociada a una `Operation` existente y luego eliminar la operación: la inversión se elimina en cascada
- [ ] Se puede crear un `Inversor` y asociarlo a múltiples `InversionParticipante` en distintas operaciones
- [ ] Se puede consultar una `Inversion` con sus participantes e inversores en una sola query con `include`
