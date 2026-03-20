# porcion-001 — Migración BD: nombreComprador, PaymentMethod y Pago [BACK]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** completado

## Descripción

Agregar el campo `nombreComprador` al modelo `Operation`, y crear los nuevos modelos `PaymentMethod` (catálogo de formas de pago por concesionaria) y `Pago` (pagos parciales registrados contra una operación). Ejecutar la migración de base de datos correspondiente.

## Ejemplo de uso

Después de esta porción, el schema de Prisma refleja los tres cambios y la base de datos está actualizada. Las demás porciones BACK pueden usar `PaymentMethod` y `Pago` en sus queries.

## Criterios de aceptación

- [ ] El modelo `Operation` incluye el campo `nombreComprador String` (obligatorio)
- [ ] Existe el modelo `PaymentMethod` con campos: `id`, `clienteId`, `nombre`, `creadoEn`; con constraint `@@unique([clienteId, nombre])` (case-insensitive se maneja en aplicación)
- [ ] Existe el modelo `Pago` con campos: `id`, `operacionId`, `clienteId`, `fecha`, `metodoPagoId`, `monto Float`, `nota String?`, `creadoEn`, `actualizadoEn`
- [ ] `Pago` tiene relaciones con `Operation`, `Client` y `PaymentMethod`
- [ ] La migración se ejecuta sin errores en base de datos existente
- [ ] El cliente Prisma se regenera correctamente tras la migración

## Pruebas

### Pruebas unitarias

- [ ] El schema de Prisma valida que `nombreComprador` es requerido en `Operation` (no acepta null)
- [ ] El schema valida el constraint `@@unique([clienteId, nombre])` en `PaymentMethod` — insertar dos registros con mismo clienteId y mismo nombre debe fallar
- [ ] El schema valida que `nota` en `Pago` es opcional (permite null)
- [ ] El campo `monto` en `Pago` es de tipo Float y no acepta strings

### Pruebas de integración

- [ ] Al ejecutar `prisma migrate dev`, la migración crea las tablas `PaymentMethod` y `Pago` y agrega la columna `nombreComprador` en `Operation` sin eliminar datos existentes
- [ ] Una operación existente antes de la migración puede actualizarse para setear `nombreComprador` sin errores
