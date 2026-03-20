# porcion-010 — Página del módulo Cobranzas — tabla expandible [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-011
**Tipo:** FRONT
**Prerequisitos:** porcion-006, porcion-007
**Estado:** completado

## Descripción

Crear la página del módulo Cobranzas con una tabla de filas expandibles. Por defecto muestra solo las operaciones con deuda pendiente. Cada fila padre muestra resumen de la operación; al expandir, se listan los pagos individuales con el saldo acumulado. Un checkbox "Mostrar todas" incluye también las operaciones saldadas, que se marcan con un ícono especial.

## Ejemplo de uso

El usuario navega al módulo Cobranzas. Ve una tabla con las operaciones pendientes. La fila de "OP-003 — Juan Pérez" muestra `Pendiente: $200.000 / Saldado: $300.000`. Al hacer clic en la fila, se expande y muestra dos subfilas con los pagos registrados y la deuda acumulada tras cada uno. Al activar "Mostrar todas", aparece también "OP-001" con un ícono verde de saldado.

## Criterios de aceptación

- [ ] La página muestra por defecto solo las operaciones con `pendiente > 0`
- [ ] Cada fila padre muestra: `idOperacion` (hipervínculo al documento), `nombreComprador`, `pendiente` y `saldado`
- [ ] Al expandir una fila, se muestran las filas hijas: una por pago con `fecha`, `forma de pago`, `monto`, `nota` y `deuda` (saldo restante acumulado tras ese pago)
- [ ] Un checkbox "Mostrar todas" incluye las operaciones con `pendiente = 0` en la tabla
- [ ] Las operaciones con `pendiente = 0` muestran un ícono indicando que están saldadas
- [ ] El hipervínculo de `idOperacion` navega al documento de la operación correspondiente
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con `mostrarTodas: false`, solo se renderizan las operaciones con `pendiente > 0`
- [ ] Con `mostrarTodas: true`, se renderizan también las operaciones con `pendiente = 0`
- [ ] Una operación con `pendiente = 0` muestra el ícono de saldado
- [ ] Al hacer clic en una fila padre, se expanden/contraen las filas hijas correctamente
- [ ] La columna `deuda` en filas hijas muestra el saldo acumulado correcto (decrementando conforme avanzan los pagos)

### Pruebas de integración

- [ ] Al activar el checkbox "Mostrar todas", la tabla incluye las operaciones saldadas sin recargar la página
- [ ] Al hacer clic en el hipervínculo de `idOperacion`, la navegación apunta a la ruta correcta del documento de operación
- [ ] La tabla carga los datos desde el endpoint de porcion-011 y los muestra correctamente
