# porcion-003 — Tarjetas KPI — vista [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-004
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-04-09

## Descripción

Crear la fila de 5 tarjetas KPI que muestran los indicadores clave del negocio para el período seleccionado: ganancia neta del mes (con delta vs período anterior), ticket promedio de venta, tasa de conversión, capital inmovilizado en stock y deuda total pendiente. Incluye estados de carga y estado vacío.

## Ejemplo de uso

El usuario ve 5 tarjetas en la parte superior del dashboard. La tarjeta "Ganancia neta" muestra "$2.450.000" y debajo "+12% vs período anterior" en verde. Si no hay datos, la tarjeta muestra "—". Mientras carga, las tarjetas muestran un skeleton animado.

## Criterios de aceptación

- [ ] Se muestran exactamente 5 tarjetas: Ganancia neta del mes, Ticket promedio de venta, Tasa de conversión, Capital inmovilizado en stock, Deuda total pendiente
- [ ] La tarjeta "Ganancia neta del mes" muestra el delta vs período anterior con color verde si es positivo, rojo si es negativo
- [ ] La tarjeta "Tasa de conversión" muestra el valor como porcentaje (ej: "34%")
- [ ] Cuando no hay datos en el período, cada tarjeta muestra "—" o 0 según corresponda
- [ ] Mientras se obtienen los datos del servidor, las tarjetas muestran un skeleton de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos válidos, cada tarjeta renderiza el valor recibido correctamente formateado
- [ ] El delta de ganancia neta muestra color verde cuando el valor es positivo
- [ ] El delta de ganancia neta muestra color rojo cuando el valor es negativo
- [ ] Con datos nulos o vacíos, las tarjetas muestran "—" o 0 sin errores de renderizado
- [ ] En estado de carga (`isLoading = true`), se renderiza el skeleton en lugar de los valores

### Pruebas de integración

- [ ] Al cambiar el período global, el componente llama al endpoint de KPIs con los nuevos parámetros `desde` y `hasta`
- [ ] Si el endpoint devuelve error, las tarjetas muestran el estado vacío sin romper el resto del dashboard
- [ ] Al recibir la respuesta del endpoint, el skeleton desaparece y los valores se muestran correctamente
