# porcion-004 — Endpoint de KPIs ejecutivos [BACK]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-003
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear el endpoint que calcula y devuelve los 5 KPIs ejecutivos para un rango de fechas dado: ganancia neta del período (más delta vs período anterior), ticket promedio de venta, tasa de conversión, capital inmovilizado en stock y deuda total pendiente.

## Ejemplo de uso

El frontend llama a `GET /api/cliente/metricas/kpis?desde=2026-04-01&hasta=2026-04-30` y recibe un objeto con los 5 indicadores calculados en base a los datos del `clienteId` del usuario autenticado.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros `desde` y `hasta` como fechas ISO en la query string
- [ ] Devuelve `gananciaNeta` sumando `ingresosNetos` de operaciones cerradas (`estado = "closed"`) en el período
- [ ] Devuelve `deltaPeriodoAnterior` comparando la ganancia neta con el período inmediatamente anterior de igual duración
- [ ] Devuelve `ticketPromedio` como promedio de `precioVentaTotal` de operaciones cerradas en el período
- [ ] Devuelve `tasaConversion` como `(operaciones cerradas / total operaciones iniciadas en el período) * 100`
- [ ] Devuelve `capitalInmovilizado` como suma de `precioOferta` de vehículos con `estado = "disponible"`
- [ ] Devuelve `deudaPendiente` como diferencia entre `precioVentaTotal` total de operaciones y suma de `Pago.monto` asociados
- [ ] Todas las consultas se filtran por `clienteId` del usuario autenticado
- [ ] Si no hay datos en el período, devuelve los valores en 0 y `deltaPeriodoAnterior` en `null`

## Pruebas

### Pruebas unitarias

- [ ] El cálculo de `deltaPeriodoAnterior` devuelve `null` cuando la ganancia del período anterior es 0
- [ ] El cálculo de `tasaConversion` devuelve 0 cuando no hay operaciones iniciadas en el período
- [ ] El cálculo de `deudaPendiente` descuenta correctamente los pagos parciales de cada operación

### Pruebas de integración

- [ ] Con operaciones cerradas en el período, el endpoint devuelve los 5 campos con valores correctos
- [ ] Con período sin datos, el endpoint devuelve todos los valores en 0 y status 200
- [ ] Sin `desde` o `hasta` en la query, el endpoint devuelve 400 con mensaje descriptivo
- [ ] Un usuario no autenticado recibe 401
- [ ] Los datos devueltos corresponden solo al `clienteId` del usuario autenticado, sin mezclar datos de otros clientes
