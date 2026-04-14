# porcion-007 — Line chart de rotación mensual — vista [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-008
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-04-09

## Descripción

Crear la sección de rotación mensual con un line chart que muestra, mes a mes dentro del período seleccionado, el ratio entre operaciones cerradas y stock disponible. Incluye estado vacío y skeleton de carga.

## Ejemplo de uso

El usuario ve un gráfico de línea con el eje X mostrando los meses (ej: "Ene", "Feb", "Mar") y el eje Y mostrando el índice de rotación. Si no hay datos, aparece el mensaje "Sin datos para el período seleccionado".

## Criterios de aceptación

- [ ] Se muestra un line chart con un punto por mes dentro del período seleccionado
- [ ] El eje X muestra el nombre abreviado del mes y año (ej: "Ene 2026")
- [ ] El eje Y muestra el valor del índice de rotación con dos decimales
- [ ] Cuando no hay datos, se muestra el mensaje "Sin datos para el período seleccionado"
- [ ] Mientras carga, se muestra un skeleton en lugar del gráfico
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos de 3 meses, el gráfico renderiza exactamente 3 puntos en el eje X
- [ ] Con array de datos vacío, se renderiza el estado vacío con el mensaje descriptivo
- [ ] En estado de carga, se renderiza el skeleton en lugar del gráfico

### Pruebas de integración

- [ ] Al cambiar el período global, el componente llama al endpoint de rotación con los nuevos parámetros `desde` y `hasta`
- [ ] Si el endpoint devuelve error, se muestra el estado vacío sin romper el resto del dashboard
