# porcion-008 — Sección "Cobranzas" en documento de operación [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-006, porcion-007
**Estado:** completado

## Descripción

Agregar la sección "Cobranzas" al documento de operación, ubicada entre las secciones "Fechas" e "Información Financiera". Muestra la tabla de pagos registrados (fecha, forma de pago, monto, nota) y los totales `saldado` y `pendiente`. Incluye un botón "Agregar pago" que abre el modal de porcion-006.

## Ejemplo de uso

El usuario abre el documento de la operación "OP-001". Ve la sección "Cobranzas" con una tabla vacía y los valores `Saldado: $0 / Pendiente: $500.000`. Hace clic en "Agregar pago", se abre el modal, completa y guarda. La tabla se actualiza mostrando el nuevo pago y los totales recalculados.

## Criterios de aceptación

- [ ] La sección "Cobranzas" aparece en el documento de operación entre "Fechas" e "Información Financiera"
- [ ] La tabla muestra columnas: fecha, forma de pago, monto y nota
- [ ] Si no hay pagos registrados, la tabla muestra un mensaje vacío (ej: "Sin pagos registrados")
- [ ] Se muestran los totales `Saldado` y `Pendiente` calculados correctamente a partir de los pagos listados
- [ ] El botón "Agregar pago" abre el modal de carga de pago (porcion-006) con el `pendiente` actual
- [ ] Al guardar un pago desde el modal, la tabla y los totales se actualizan sin recargar la página
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con lista de pagos vacía, muestra mensaje de tabla vacía y `Saldado: $0`
- [ ] Con dos pagos de $100.000 cada uno y `precioVentaTotal: $500.000`, muestra `Saldado: $200.000` y `Pendiente: $300.000`
- [ ] El botón "Agregar pago" renderiza y al hacer clic dispara la apertura del modal

### Pruebas de integración

- [ ] Al guardar un pago desde el modal, la tabla de pagos de la sección muestra el nuevo registro
- [ ] Los totales `saldado` y `pendiente` se recalculan correctamente tras agregar un pago
