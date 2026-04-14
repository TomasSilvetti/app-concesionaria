# porcion-010 — Endpoint de cobros por método de pago [BACK]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-009
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear el endpoint que agrupa y suma los cobros (`Pago`) por método de pago dentro del período seleccionado, devolviendo el nombre del método y el monto total para cada uno.

## Ejemplo de uso

El frontend llama a `GET /api/cliente/metricas/cobros-por-metodo?desde=2026-04-01&hasta=2026-04-30` y recibe un array con objetos como `{ metodo: "Efectivo", monto: 1200000 }` por cada método con cobros en el período.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros `desde` y `hasta` como fechas ISO en la query string
- [ ] Devuelve un array de objetos con los campos `metodo` (nombre del método de pago) y `monto` (suma total)
- [ ] Solo se incluyen pagos (`Pago`) cuya `fecha` esté dentro del rango `desde`-`hasta`
- [ ] Los métodos sin pagos en el período no aparecen en el resultado
- [ ] Todas las consultas se filtran por `clienteId` del usuario autenticado
- [ ] Si no hay pagos en el período, devuelve un array vacío

## Pruebas

### Pruebas unitarias

- [ ] Con 3 pagos en efectivo de $100.000 cada uno, devuelve `{ metodo: "Efectivo", monto: 300000 }`
- [ ] Pagos fuera del rango de fechas no se incluyen en el cálculo
- [ ] Métodos sin pagos en el período no aparecen en el array resultante

### Pruebas de integración

- [ ] Con pagos de múltiples métodos en el período, el endpoint devuelve un objeto por cada método con la suma correcta
- [ ] Con período sin pagos, el endpoint devuelve array vacío y status 200
- [ ] Un usuario no autenticado recibe 401
- [ ] Los datos pertenecen únicamente al `clienteId` del usuario autenticado
