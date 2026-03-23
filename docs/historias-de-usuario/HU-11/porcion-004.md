# porcion-004 — Reestructurar layout del modo edición a 3 columnas [FRONT]

**Historia de usuario:** HU-11: Layout unificado y modo lectura en el detalle de operación
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-23
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Reestructurar el modo edición (`/operaciones/[id]/edit/page.tsx`) para que use el mismo grid de 3 columnas que la vista de detalle. Esto implica:

1. Cambiar el grid principal de `lg:grid-cols-2` a `lg:grid-cols-3`.
2. Reemplazar la tabla estática "Gastos Asociados (solo lectura)" por `OperationExpensesSection` con `readOnly={false}`, posicionada como columna derecha con `lg:col-span-1 lg:row-span-3 lg:row-start-1`.
3. Agregar `OperationCobranzasSection` (con `readOnly={false}`) donde corresponde en el grid, igual que en el detalle.
4. Actualizar los col-spans de todas las secciones para que coincidan con el detalle:
   - Datos del vehículo: `lg:col-span-2 lg:row-start-1`
   - Fechas: `lg:col-span-2 lg:row-start-2`
   - Información Financiera: `lg:col-span-3`
   - Estado y Tipo: `lg:col-span-3`
   - Vehículos de Intercambio: `lg:col-span-3`
   - Cerrar operación: `lg:col-span-3`
5. Agregar los imports de `OperationExpensesSection` y `OperationCobranzasSection`.
6. Conectar `OperationExpensesSection` con `onTotalChange={setGastosAsociados}` para que los totales de gastos sigan alimentando el cálculo de Información Financiera.
7. Agregar estado `[pendienteReal, setPendienteReal]` y conectarlo a `OperationCobranzasSection` vía `onPendienteChange`.

## Archivos a modificar

- `src/app/operaciones/[id]/edit/page.tsx`

## Criterios de aceptación

- [ ] El modo edición usa un grid de 3 columnas en pantallas `lg`
- [ ] `OperationExpensesSection` aparece en la columna derecha (col 3) abarcando 3 filas, igual que en el detalle
- [ ] `OperationCobranzasSection` aparece en la posición equivalente al detalle (col-span-2)
- [ ] La tabla estática "Gastos Asociados (solo lectura)" ya no existe en el edit
- [ ] Al agregar un gasto desde el modo edición, el total de "Gastos Asociados" en Información Financiera se actualiza reactivamente
- [ ] Al agregar un pago desde el modo edición, la tabla de cobranzas se actualiza
- [ ] Todos los campos editables (fechas, precios, tipo, estado) siguen funcionando igual que antes
- [ ] El banner de operación cerrada y el botón "Cerrar operación" siguen funcionando
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Entrar al modo edición de una operación → verificar que el layout se ve igual al detalle (3 columnas, gastos a la derecha)
- [ ] Agregar un gasto desde el modo edición → verificar que el total en "Gastos Asociados" de Información Financiera se actualiza
- [ ] Agregar un pago desde el modo edición → verificar que aparece en la tabla de cobranzas
- [ ] Guardar cambios desde el modo edición → verificar que redirige al detalle correctamente
- [ ] Verificar que el detalle sigue funcionando en solo lectura (sin botones de agregar) después de los cambios
