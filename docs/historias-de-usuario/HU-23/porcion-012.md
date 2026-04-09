# porcion-012 — Endpoint de ROI por inversor [BACK]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-011
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Crear el endpoint que calcula el ROI de cada inversor en base a las operaciones con inversión dentro del período seleccionado, usando los campos `montoAporte` y `porcentajeUtilidad` de `InversionParticipante`.

## Ejemplo de uso

El frontend llama a `GET /api/cliente/metricas/roi-inversores?desde=2026-04-01&hasta=2026-04-30` y recibe un array con objetos como `{ inversor: "Juan Pérez", montoAportado: 500000, retorno: 115000, roi: 23.00 }` por cada inversor con participación en el período.

## Criterios de aceptación

- [ ] El endpoint acepta los parámetros `desde` y `hasta` como fechas ISO en la query string
- [ ] Devuelve un array de objetos con los campos: `inversor` (nombre), `montoAportado` (suma de `montoAporte`), `retorno` (calculado), `roi` (porcentaje con dos decimales)
- [ ] El `retorno` se calcula como `montoAporte * porcentajeUtilidad / 100` por participación, sumado por inversor
- [ ] El `roi` se calcula como `(retorno / montoAportado) * 100`
- [ ] Solo se consideran `InversionParticipante` vinculados a `Inversion` cuya operación tiene `fechaVenta` dentro del período y `estado = "closed"`
- [ ] Se excluyen participantes con `esConcecionaria = true` (solo se listan inversores externos)
- [ ] Todas las consultas se filtran por `clienteId` del usuario autenticado
- [ ] Si no hay inversiones en el período, devuelve un array vacío

## Pruebas

### Pruebas unitarias

- [ ] Con `montoAporte = 500000` y `porcentajeUtilidad = 20`, el retorno calculado es `100000` y el ROI es `20.00%`
- [ ] Un participante con `esConcecionaria = true` no aparece en el resultado
- [ ] Con `porcentajeUtilidad = null`, el retorno de esa participación se trata como 0 sin error
- [ ] Si un inversor tiene múltiples participaciones en el período, sus valores se suman correctamente en una sola fila

### Pruebas de integración

- [ ] Con inversiones en operaciones cerradas en el período, el endpoint devuelve los inversores con ROI correcto
- [ ] Con período sin operaciones cerradas con inversión, el endpoint devuelve array vacío y status 200
- [ ] Un usuario no autenticado recibe 401
- [ ] Los datos pertenecen únicamente al `clienteId` del usuario autenticado
