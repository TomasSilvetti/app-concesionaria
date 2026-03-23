# porcion-003 — Bloquear pagos y mostrar modal "Operación cerrada" [FRONT]

**Historia de usuario:** HU-10: Cierre y Reapertura de Operaciones con Validación de Pagos
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Una vez que la API devuelve `estado: "cerrada"` tras registrar un pago, el frontend debe:

1. Mostrar un modal "Operación cerrada" con un único botón "Aceptar" que redirige a `/operaciones`.
2. En `OperationCobranzasSection`: deshabilitar el botón "Agregar pago" cuando la operación está cerrada, con un hint informativo.
3. En la vista de detalle: cuando la operación está cerrada y el pendiente es $0, el botón "Cerrar operación" muestra un modal de advertencia de confirmación directa (sin PaymentModal) en lugar de abrir el modal de pago.

## Ejemplo de uso

- El empleado registra el último pago → API responde con `estado: "cerrada"` → aparece modal "Operación cerrada" → clic en "Aceptar" → redirige a `/operaciones`.
- El empleado reabre la operación, vuelve al detalle → "Agregar pago" está deshabilitado con hint → "Cerrar operación" está disponible → al hacer clic aparece *"¿Estás seguro de cerrar la operación?"* → confirma → estado cambia a `cerrada`.

## Criterios de aceptación

- [ ] Tras recibir `estado: "cerrada"` en la respuesta de un pago, se muestra el modal "Operación cerrada"
- [ ] El modal tiene un único botón "Aceptar" que redirige a `/operaciones`
- [ ] En `OperationCobranzasSection`, el botón "Agregar pago" está deshabilitado cuando `estado === "cerrada"`, con un hint visible para el usuario
- [ ] En la vista de detalle con `estado === "cerrada"` y `pendiente === 0`, el botón "Cerrar operación" muestra un modal de confirmación directa: *"¿Estás seguro de cerrar la operación?"*
- [ ] Si el empleado confirma desde ese modal, se llama al endpoint correspondiente para cambiar el estado a `cerrada` (sin registrar pago)
- [ ] El estado `cerrada/abierta` se propaga correctamente en la UI tras cada cambio

## Pruebas

### Pruebas manuales

- [ ] Registrar el pago final → verificar que aparece el modal y redirige a `/operaciones`
- [ ] Reabrir la operación, volver al detalle → "Agregar pago" deshabilitado con hint visible
- [ ] Con operación reabierta, hacer clic en "Cerrar operación" → aparece modal de confirmación → confirmar → estado vuelve a `cerrada`
