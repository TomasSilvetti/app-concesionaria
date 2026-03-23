# porcion-001 — Agregar prop `readOnly` a OperationExpensesSection [FRONT]

**Historia de usuario:** HU-11: Layout unificado y modo lectura en el detalle de operación
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** —

## Descripción

Agregar la prop opcional `readOnly` a `OperationExpensesSection`. Cuando `readOnly={true}`, el botón "Agregar" del header del módulo de gastos no se renderiza. El resto del componente (tabla, edición, eliminación inline) permanece sin cambios.

## Archivos a modificar

- `src/components/operations/OperationExpensesSection.tsx`

## Cambios esperados

1. Agregar `readOnly?: boolean` a la interfaz `Props`.
2. Desestructurar `readOnly = false` en los parámetros de la función.
3. Envolver el botón "Agregar" (línea ~298) con `{!readOnly && (...)}`.

## Criterios de aceptación

- [ ] El componente acepta la prop `readOnly` sin errores de TypeScript
- [ ] Con `readOnly={true}`: el botón "Agregar" no aparece en el DOM
- [ ] Con `readOnly={false}` o sin la prop: el comportamiento es idéntico al actual
- [ ] El resto del componente (tabla de gastos, editar, eliminar) no se ve afectado

## Pruebas

### Pruebas manuales

- [ ] Pasar `readOnly={true}` temporalmente en el detalle de una operación → verificar que el botón "Agregar" desaparece
- [ ] Verificar que sin `readOnly` el botón sigue visible y funcional
