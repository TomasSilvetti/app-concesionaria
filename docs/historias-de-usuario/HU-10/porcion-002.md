# porcion-002 — Corregir pendiente real en modal "Cerrar operación" [FRONT]

**Historia de usuario:** HU-10: Cierre y Reapertura de Operaciones con Validación de Pagos
**Par:** porcion-001
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** porcion-001

## Descripción

El botón "Cerrar operación" en la vista de detalle actualmente pasa `precioVentaTotal` como pendiente al `PaymentModal`, ignorando los pagos ya registrados. Corregir esto para que el modal reciba el saldo pendiente real.

La solución implica exponer el `pendiente` calculado desde `OperationCobranzasSection` hacia la página padre (`operaciones/[id]/page.tsx`), de modo que el modal de "Cerrar operación" use ese valor.

## Ejemplo de uso

- Operación con precio total $25.000 y $10.000 ya pagados.
- El botón "Pagó todo" en el modal de "Cerrar operación" debe mostrar $15.000, no $25.000.

## Criterios de aceptación

- [ ] `OperationCobranzasSection` expone el valor `pendiente` actual hacia el componente padre mediante una prop callback `onPendienteChange`
- [ ] La página de detalle (`operaciones/[id]/page.tsx`) recibe ese `pendiente` y lo pasa al `PaymentModal` del botón "Cerrar operación"
- [ ] El botón "Pagó todo" dentro del modal de "Cerrar operación" autocompleta con el saldo pendiente real
- [ ] Si el pendiente es $0 (operación ya saldada), el modal de "Cerrar operación" no se abre como PaymentModal (ese caso lo cubre porcion-003)

## Pruebas

### Pruebas manuales

- [ ] Registrar un pago parcial desde "Cobranzas" y luego abrir el modal "Cerrar operación" → "Pagó todo" debe mostrar el saldo restante correcto
- [ ] Con saldo $0, el botón "Cerrar operación" no debe abrir el PaymentModal
