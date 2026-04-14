# porcion-009 — Pie chart de cobros por método de pago — vista [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-010
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** 🔄 En progreso

## Descripción

Crear la sección de cobros por método de pago con un pie chart que muestra la distribución del monto total cobrado según cada método de pago en el período seleccionado. Incluye estado vacío y skeleton de carga.

## Ejemplo de uso

El usuario ve un gráfico de torta con segmentos para cada método: "Efectivo: $1.200.000 (60%)", "Transferencia: $600.000 (30%)", "Cheque: $200.000 (10%)". Si no hay cobros, aparece el mensaje "Sin datos para el período seleccionado".

## Criterios de aceptación

- [ ] Se muestra un pie chart con un segmento por cada método de pago con cobros en el período
- [ ] Cada segmento muestra el nombre del método, el monto total y el porcentaje sobre el total
- [ ] La leyenda lista todos los métodos con su color correspondiente
- [ ] Cuando no hay cobros en el período, se muestra el mensaje "Sin datos para el período seleccionado"
- [ ] Mientras carga, se muestra un skeleton en lugar del gráfico
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos de 3 métodos de pago, el gráfico renderiza exactamente 3 segmentos
- [ ] Con array de datos vacío, se renderiza el estado vacío con el mensaje descriptivo
- [ ] En estado de carga, se renderiza el skeleton en lugar del gráfico
- [ ] El porcentaje de cada segmento suma 100% cuando se tienen todos los datos

### Pruebas de integración

- [ ] Al cambiar el período global, el componente llama al endpoint de cobros con los nuevos parámetros `desde` y `hasta`
- [ ] Si el endpoint devuelve error, se muestra el estado vacío sin romper el resto del dashboard
