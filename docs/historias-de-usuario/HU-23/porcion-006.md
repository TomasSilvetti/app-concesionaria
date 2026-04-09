# porcion-006 — Endpoint de aging de deuda [BACK]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-005
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear el endpoint que calcula la distribución de deuda pendiente agrupada en tres rangos de antigüedad (0-30, 31-60 y +60 días) según la fecha de inicio de cada operación con saldo pendiente.

## Ejemplo de uso

El frontend llama a `GET /api/cliente/metricas/aging-deuda?desde=2026-04-01&hasta=2026-04-30` y recibe los montos de deuda agrupados por rango de días desde la fecha de inicio de la operación hasta hoy.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros `desde` y `hasta` como fechas ISO en la query string
- [ ] Devuelve tres campos: `rango0a30`, `rango31a60`, `rangoMas60`, cada uno con el monto total de deuda en ese rango
- [ ] La deuda se calcula como `precioVentaTotal - suma(Pago.monto)` por operación con saldo > 0
- [ ] El rango de la deuda se determina por los días transcurridos desde `fechaInicio` de la operación hasta la fecha actual
- [ ] Solo se consideran operaciones dentro del período `desde`-`hasta` y con `clienteId` del usuario autenticado
- [ ] Si no hay deuda, devuelve los tres rangos en 0

## Pruebas

### Pruebas unitarias

- [ ] Una operación con 25 días desde su inicio cae en el rango `rango0a30`
- [ ] Una operación con 45 días desde su inicio cae en el rango `rango31a60`
- [ ] Una operación con 70 días desde su inicio cae en el rango `rangoMas60`
- [ ] Una operación con saldo = 0 (totalmente pagada) no se incluye en ningún rango

### Pruebas de integración

- [ ] Con operaciones con saldo pendiente, el endpoint devuelve los montos distribuidos correctamente en los rangos
- [ ] Con período sin operaciones con deuda, el endpoint devuelve los tres rangos en 0 y status 200
- [ ] Un usuario no autenticado recibe 401
- [ ] Los datos pertenecen únicamente al `clienteId` del usuario autenticado
