# porcion-008 — Módulo Gastos — tabla de gastos con filtros [FRONT]

**Estado:** completada

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-009
**Tipo:** FRONT
**Prerequisitos:** porcion-004

## Descripción

Agregar la tabla de gastos al Módulo Gastos. Muestra todos los gastos de todas las operaciones con columnas: operación (ID), descripción, quién pagó, monto y fecha. Incluye filtros por período (sincronizado con el selector global de la página), por operación y por quién pagó. La tabla se actualiza al cambiar cualquier filtro.

## Ejemplo de uso

El usuario está en el Módulo Gastos. Más abajo de los gráficos ve una tabla con todas las filas de gastos del período. Usa el filtro "Quién pagó" para ver solo los gastos a cargo de "Juan" y la tabla se reduce a las filas correspondientes. Luego limpia el filtro y la tabla vuelve a mostrar todos los gastos del período.

## Criterios de aceptación

- [ ] La tabla muestra las columnas: operación (ID/referencia), descripción, quién pagó, monto y fecha
- [ ] La tabla se inicializa con los gastos del período por defecto (sincronizado con el selector global)
- [ ] Al cambiar el período en el selector global de la página, la tabla se actualiza automáticamente
- [ ] Existe un filtro por operación (buscador de ID o referencia de operación)
- [ ] Existe un filtro por quién pagó (selector con los valores presentes en los gastos)
- [ ] Al limpiar todos los filtros, la tabla vuelve al estado filtrado solo por período
- [ ] Mientras los datos cargan, la tabla muestra un estado de carga
- [ ] Si no hay gastos para los filtros aplicados, la tabla muestra un estado vacío con mensaje
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al cambiar el período global, el parámetro `desde`/`hasta` enviado al servicio de la tabla se actualiza en consecuencia
- [ ] Al aplicar el filtro por quién pagó con un valor específico, la llamada al servicio incluye ese parámetro
- [ ] Cuando la respuesta del servicio es una lista vacía, la tabla renderiza la fila de "sin resultados"

### Pruebas de integración

- [ ] Al montar el módulo, la tabla realiza la llamada a `GET /api/gastos?desde=...&hasta=...` con el período por defecto y renderiza las filas
- [ ] Al combinar filtro de período + filtro de quién pagó, la llamada incluye ambos parámetros simultáneamente
