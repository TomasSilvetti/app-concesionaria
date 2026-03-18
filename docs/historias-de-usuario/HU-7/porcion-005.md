# porcion-005 — Endpoint de métricas financieras [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar el endpoint que calcula y devuelve las métricas financieras del período seleccionado: Total vendido bruto, Total precio de toma, Total gastado, Ganancia y Plata por cobrar. Los primeros cuatro se filtran por el rango de fechas recibido (operaciones cerradas en el período); "Plata por cobrar" se calcula siempre sobre todas las operaciones abiertas, sin filtro de período.

## Ejemplo de uso

El frontend de porcion-004 llama a `GET /api/gastos/metricas?desde=2026-02-01&hasta=2026-02-28` y recibe `{ totalVendidoBruto: 1200000, totalPrecioDeToma: 800000, totalGastado: 85000, ganancia: 315000, plataPorCobrar: 420000 }`.

## Criterios de aceptación

- [ ] `GET /api/gastos/metricas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` devuelve los cinco campos definidos
- [ ] `totalVendidoBruto` = `SUM(precioVentaTotal)` de operaciones con `estado = 'cerrada'` y `fechaVenta` dentro del período
- [ ] `totalPrecioDeToma` = `SUM(precioToma)` de las mismas operaciones cerradas del período
- [ ] `totalGastado` = `SUM(gastos.monto)` de los gastos asociados a esas operaciones cerradas del período
- [ ] `ganancia` = `totalVendidoBruto − totalPrecioDeToma − totalGastado`
- [ ] `plataPorCobrar` = `SUM(ingresosNetos)` de operaciones con `estado = 'abierta'` (sin filtro de período)
- [ ] Si no hay operaciones cerradas en el período, todos los valores (excepto `plataPorCobrar`) devuelven 0
- [ ] El endpoint verifica el `clienteId` del usuario autenticado para no mezclar datos entre empresas
- [ ] Los parámetros `desde` y `hasta` son requeridos; si faltan, el endpoint devuelve 400

## Pruebas

### Pruebas unitarias

- [ ] El servicio calcula `ganancia` correctamente como `totalVendidoBruto − totalPrecioDeToma − totalGastado` con valores conocidos
- [ ] Si no hay operaciones cerradas en el período, el servicio devuelve todos los campos numéricos en 0 sin lanzar excepción
- [ ] `plataPorCobrar` se calcula ignorando el filtro de período aunque se pasen `desde` y `hasta`

### Pruebas de integración

- [ ] `GET /api/gastos/metricas` sin parámetros `desde`/`hasta` devuelve 400
- [ ] Con un período que contiene 2 operaciones cerradas y sus gastos, los valores calculados coinciden con la suma manual de los registros en la base de datos
- [ ] Un usuario de otra empresa no puede ver las métricas de otra empresa (devuelve solo sus propios datos)
