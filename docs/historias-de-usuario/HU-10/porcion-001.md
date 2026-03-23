# porcion-001 — Validar sobrepago y auto-cerrar operación en API de pagos [BACK]

**Historia de usuario:** HU-10: Cierre y Reapertura de Operaciones con Validación de Pagos
**Par:** porcion-002
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** Ninguno

## Descripción

Modificar el endpoint `POST /api/operations/[id]/pagos` para:
1. Calcular el saldo pendiente real antes de registrar el pago (precio total − suma de pagos ya registrados).
2. Rechazar el pago si el monto supera el saldo pendiente, devolviendo un error 400 con mensaje descriptivo.
3. Después de guardar el pago, si el saldo resultante es $0, cambiar automáticamente el estado de la operación a `cerrada`.
4. Incluir el `estado` actualizado de la operación en la respuesta del endpoint.

## Ejemplo de uso

- Operación con precio total $25.000 y $10.000 ya pagados → saldo pendiente $15.000.
- Si el empleado intenta pagar $20.000 → error 400: *"El monto supera el saldo pendiente"*.
- Si paga $15.000 → se registra el pago, el estado cambia a `cerrada` y la respuesta incluye `{ estado: "cerrada" }`.

## Criterios de aceptación

- [ ] El endpoint calcula el saldo pendiente real antes de persistir el pago
- [ ] Si `monto > saldo pendiente`, devuelve HTTP 400 con `{ error: "El monto supera el saldo pendiente" }`
- [ ] Si el pago deja el saldo en $0, el estado de la operación se actualiza a `cerrada` en la misma transacción
- [ ] La respuesta del endpoint incluye el campo `estado` con el valor actualizado de la operación
- [ ] Si el saldo no llega a $0, el estado no se modifica

## Pruebas

### Pruebas unitarias

- [ ] Pago válido (monto ≤ pendiente, saldo resultante > 0) → se registra, estado sin cambios
- [ ] Pago de saldo exacto (monto = pendiente) → se registra, estado cambia a `cerrada`
- [ ] Pago excesivo (monto > pendiente) → rechazado con 400
- [ ] Pago sobre operación ya cerrada → rechazado con error apropiado
