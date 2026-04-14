# porcion-005 — Gráfico de aging de deuda — vista [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** porcion-006
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-04-09

## Descripción

Crear la sección de aging de deuda con una barra apilada que muestra la distribución de la deuda pendiente en tres rangos de antigüedad: 0-30 días, 31-60 días y +60 días. Incluye estado vacío y skeleton de carga.

## Ejemplo de uso

El usuario ve una barra horizontal apilada con tres colores: verde para deuda 0-30 días ($500.000), amarillo para 31-60 días ($200.000) y rojo para +60 días ($80.000). Si no hay deuda, aparece el mensaje "Sin datos para el período seleccionado".

## Criterios de aceptación

- [ ] Se muestra una barra apilada con los tres rangos: 0-30 días, 31-60 días y +60 días
- [ ] Cada rango tiene un color diferenciado y una leyenda con el monto total
- [ ] Cuando todos los rangos son 0, se muestra el mensaje "Sin datos para el período seleccionado"
- [ ] Mientras carga, se muestra un skeleton en lugar del gráfico
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos válidos, la barra renderiza los tres segmentos con el ancho proporcional a cada monto
- [ ] Con todos los valores en 0, se renderiza el estado vacío con el mensaje descriptivo
- [ ] En estado de carga, se renderiza el skeleton en lugar de la barra

### Pruebas de integración

- [ ] Al cambiar el período global, el componente llama al endpoint de aging con los nuevos parámetros `desde` y `hasta`
- [ ] Si el endpoint devuelve error, se muestra el estado vacío sin romper el resto del dashboard
