# porcion-004 — Sección de distribución de utilidades en detalle de operación [FRONT]

**Historia de usuario:** HU-18: Inversores en operaciones
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** porcion-002

## Descripción

Agregar al detalle de la operación, debajo de la sección de gastos, una nueva sección que muestre la distribución de utilidades entre los participantes de la inversión. Incluye el resumen financiero (valor de venta, precio de toma, gastos asociados, utilidad neta) y el desglose por participante. En modo edición permite modificar el monto o el porcentaje de utilidad de cada participante, recalculando el otro campo automáticamente.

## Ejemplo de uso

El usuario abre el detalle de una operación con inversión. Ve una sección "Distribución de utilidades" con: Valor de venta $50.000, Precio de toma $40.000, Gastos $2.000, Utilidad neta $8.000. Debajo, la tabla muestra: Concesionaria — $4.800 (60%) y Juan Pérez — $3.200 (40%). En modo edición puede cambiar el monto de Juan a $4.000 y el porcentaje se actualiza a 50%, o viceversa.

## Criterios de aceptación

- [ ] La sección "Distribución de utilidades" solo se muestra si la operación tiene inversión registrada
- [ ] La sección aparece debajo de la sección de gastos en el detalle de la operación
- [ ] Se muestran los valores: valor de venta, precio de toma, gastos asociados y utilidad neta calculada
- [ ] Se muestra una fila por participante con: nombre, monto de utilidad y porcentaje de utilidad
- [ ] En modo lectura todos los campos son solo lectura
- [ ] En modo edición, al modificar el monto de utilidad de un participante el porcentaje se recalcula automáticamente
- [ ] En modo edición, al modificar el porcentaje de utilidad de un participante el monto se recalcula automáticamente
- [ ] Cuando la operación está cerrada o cancelada, la sección siempre se muestra en solo lectura
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] La utilidad neta se calcula correctamente como `precioVentaTotal - precioToma - gastosAsociados`
- [ ] Al editar el monto de un participante, el porcentaje resultante es `monto / utilidadNeta * 100`
- [ ] Al editar el porcentaje de un participante, el monto resultante es `porcentaje / 100 * utilidadNeta`
- [ ] Si la utilidad neta es $0, los campos de monto y porcentaje muestran "—" y no son editables
- [ ] La sección no se renderiza cuando la operación no tiene inversión asociada

### Pruebas de integración

- [ ] Al entrar al detalle de una operación con inversión, la sección se muestra con los datos correctos obtenidos del endpoint (porcion-005)
- [ ] En modo edición, al modificar el porcentaje de utilidad y guardar, los cambios se reflejan al volver a modo lectura
- [ ] En una operación con estado "cerrada", el modo edición no está disponible y la sección aparece en solo lectura
