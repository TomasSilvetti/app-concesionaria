# porcion-011 — Endpoint GET cobranzas con saldado/pendiente calculados [BACK]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-010
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-010
**Estado:** 🔄 En progreso

## Descripción

Crear el endpoint que devuelve el listado de operaciones para el módulo Cobranzas, con los valores `saldado` y `pendiente` calculados en runtime, y el detalle de cada pago con su `deuda` acumulada. Soporta un parámetro de filtro para incluir o excluir operaciones completamente saldadas.

## Ejemplo de uso

El frontend hace `GET /api/cobranzas?mostrarTodas=false`. El backend retorna las operaciones con `pendiente > 0` del `clienteId` autenticado, cada una con su array de pagos ordenados por fecha y el campo `deuda` calculado para cada pago (saldo restante tras ese pago).

## Criterios de aceptación

- [ ] `GET /api/cobranzas` acepta el query param `mostrarTodas` (boolean, default `false`)
- [ ] Con `mostrarTodas=false`, devuelve solo operaciones con `pendiente > 0`
- [ ] Con `mostrarTodas=true`, devuelve todas las operaciones del cliente
- [ ] Cada operación en la respuesta incluye: `idOperacion`, `nombreComprador`, `precioVentaTotal`, `saldado` (calculado), `pendiente` (calculado)
- [ ] Cada operación incluye un array `pagos` ordenado por `fecha` ASC, donde cada pago tiene: `fecha`, `metodoPago` (nombre), `monto`, `nota`, `deuda` (saldo restante tras ese pago)
- [ ] El endpoint filtra por `clienteId` del usuario autenticado
- [ ] `saldado = SUM(pago.monto)` y `pendiente = precioVentaTotal - saldado` se calculan en runtime (no son columnas en BD)
- [ ] `deuda` de cada pago = `precioVentaTotal - SUM(pagos hasta e inclusive ese pago, por fecha ASC)`

## Pruebas

### Pruebas unitarias

- [ ] La función de cálculo de `deuda` por pago devuelve valores correctos para una serie ordenada de pagos
- [ ] Con `precioVentaTotal: 500.000` y pagos de `[200.000, 300.000]`, el primer pago tiene `deuda: 300.000` y el segundo `deuda: 0`
- [ ] Con `mostrarTodas: false` y una operación con `pendiente = 0`, esa operación no aparece en el resultado
- [ ] Con `mostrarTodas: true`, la operación saldada sí aparece

### Pruebas de integración

- [ ] `GET /api/cobranzas` devuelve solo las operaciones del cliente autenticado, no las de otros clientes
- [ ] `GET /api/cobranzas?mostrarTodas=false` excluye correctamente las operaciones completamente saldadas
- [ ] `GET /api/cobranzas?mostrarTodas=true` incluye operaciones saldadas con `pendiente: 0`
- [ ] Los pagos de cada operación vienen ordenados por `fecha` ASC
- [ ] `GET /api/cobranzas` sin autenticación retorna 401
