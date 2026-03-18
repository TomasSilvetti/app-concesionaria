# porcion-004 — Módulo Gastos — página, selector de período y métricas [FRONT]

**Estado:** 🔄 En progreso

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la página del Módulo Gastos accesible desde el menú de navegación principal. Incluye el selector de rango de fechas (con el último mes como valor por defecto), las tarjetas de métricas financieras (Total vendido bruto, Total gastado, Ganancia) y el indicador "Plata por cobrar". Al cambiar el período, todas las métricas se recalculan automáticamente consumiendo el endpoint correspondiente.

## Ejemplo de uso

El usuario hace clic en "Gastos" en el menú lateral. Aterriza en la página del módulo, donde ve el selector de período con "último mes" preseleccionado y tres tarjetas: "Total vendido bruto: $1.200.000", "Total gastado: $85.000", "Ganancia: $315.000". Más abajo aparece "Plata por cobrar: $420.000". Cambia el período a los últimos 3 meses y todas las tarjetas se actualizan.

## Criterios de aceptación

- [ ] La página es accesible desde el menú de navegación principal con la entrada "Gastos"
- [ ] Al cargar la página, el selector de período tiene por defecto el rango del último mes
- [ ] Se muestran las tarjetas: "Total vendido bruto", "Total gastado" y "Ganancia"
- [ ] Se muestra el indicador "Plata por cobrar" (no se filtra por período, siempre muestra el valor actual)
- [ ] Al cambiar el rango de fechas en el selector, las métricas se actualizan automáticamente con una llamada al backend
- [ ] Mientras los datos cargan, las tarjetas muestran un estado de carga (skeleton o spinner)
- [ ] Si el backend devuelve error, se muestra un mensaje de error en la sección de métricas
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al montar la página, el selector de período se inicializa con el primer y último día del mes anterior como fechas
- [ ] Al cambiar el rango de fechas, se dispara la llamada al servicio de métricas con los nuevos parámetros `desde` y `hasta`
- [ ] Si las métricas devuelven todos valores en cero, las tarjetas muestran "$0" sin errores visuales

### Pruebas de integración

- [ ] Al cargar la página, se realiza la llamada a `GET /api/gastos/metricas?desde=...&hasta=...` y los valores de las tarjetas se renderizan con los datos recibidos
- [ ] Al cambiar el período, la nueva llamada a métricas usa el rango actualizado y las tarjetas se refrescan con los nuevos valores
