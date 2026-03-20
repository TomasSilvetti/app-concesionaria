# porcion-001 — Migración: campo `quien_pago` en Expense [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-18

## Descripción

Agregar el campo `quien_pago` al modelo `Expense` en Prisma. Este campo permite registrar quién pagó cada gasto: puede ser un usuario de la empresa (FK a `User`) o el valor fijo `"dueno_auto"` para indicar que lo pagó el dueño del vehículo. Se agrega también el campo de relación opcional y se genera la migración correspondiente.

## Ejemplo de uso

Un gasto tiene `quien_pago = "dueno_auto"` o `quien_pago = null` con `quienPagoUserId = "uuid-del-usuario"`. El backend puede determinar el nombre a mostrar según cuál de los dos campos está presente.

## Criterios de aceptación

- [ ] El modelo `Expense` en `schema.prisma` incluye el campo `quienPagoUserId` (String?, FK opcional a `User`)
- [ ] El modelo `Expense` incluye el campo `quienPagoEspecial` (String?, para almacenar el valor `"dueno_auto"`)
- [ ] El modelo `User` incluye la relación inversa `gastosComoQuienPago Expense[]`
- [ ] La migración se genera y aplica sin errores en la base de datos existente
- [ ] Los registros existentes en `Expense` no se ven afectados (los nuevos campos son opcionales)

## Pruebas

### Pruebas unitarias

- [ ] Se puede crear un `Expense` con `quienPagoUserId` apuntando a un `User` existente y los demás campos requeridos presentes
- [ ] Se puede crear un `Expense` con `quienPagoEspecial = "dueno_auto"` y `quienPagoUserId = null`
- [ ] Se puede crear un `Expense` con ambos campos `quien_pago` nulos (registro sin quién pagó asignado)
- [ ] Intentar crear un `Expense` con `quienPagoUserId` apuntando a un `User` inexistente lanza error de FK

### Pruebas de integración

- [ ] Ejecutar la migración sobre la base de datos de desarrollo no rompe registros previos en `Expense`
- [ ] Una query que incluya `quienPagoUser { nombre }` en el select de Prisma devuelve el nombre del usuario correctamente cuando el campo está seteado
