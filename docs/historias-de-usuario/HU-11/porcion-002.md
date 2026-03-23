# porcion-002 — Agregar prop `readOnly` a OperationCobranzasSection [FRONT]

**Historia de usuario:** HU-11: Layout unificado y modo lectura en el detalle de operación
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** —

## Descripción

Agregar la prop opcional `readOnly` a `OperationCobranzasSection`. Cuando `readOnly={true}`, el botón "Agregar pago" y el hint "La operación está cerrada" no se renderizan. La tabla de pagos y los totales de saldado/pendiente permanecen visibles.

## Archivos a modificar

- `src/components/operations/OperationCobranzasSection.tsx`

## Cambios esperados

1. Agregar `readOnly?: boolean` a la interfaz `Props`.
2. Desestructurar `readOnly = false` en los parámetros de la función.
3. Envolver el bloque del botón "Agregar pago" + hint (líneas ~125-149) con `{!readOnly && (...)}`.

## Criterios de aceptación

- [ ] El componente acepta la prop `readOnly` sin errores de TypeScript
- [ ] Con `readOnly={true}`: el botón "Agregar pago" no aparece en el DOM
- [ ] Con `readOnly={true}`: el hint "La operación está cerrada" no aparece en el DOM
- [ ] Con `readOnly={false}` o sin la prop: el comportamiento es idéntico al actual
- [ ] La tabla de pagos y los totales saldado/pendiente siguen visibles en modo `readOnly`

## Pruebas

### Pruebas manuales

- [ ] Pasar `readOnly={true}` temporalmente en el detalle de una operación → verificar que el botón "Agregar pago" desaparece
- [ ] Verificar que la tabla de pagos y los montos siguen siendo visibles
- [ ] Verificar que sin `readOnly` el botón sigue visible y funcional
