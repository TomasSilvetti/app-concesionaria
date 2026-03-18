# porcion-006 — Módulo Gastos — gráficos de torta [FRONT]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-007
**Tipo:** FRONT
**Prerequisitos:** porcion-004

## Descripción

Agregar dos gráficos de torta al Módulo Gastos. El primero muestra la distribución de operaciones cerradas y canceladas del período seleccionado (también indica el total general). El segundo muestra el inventario actual: valor revista vs. valor real de los vehículos disponibles y en operación abierta. El gráfico de inventario no se filtra por período. Ambos se sincronizan con el selector de período de la página cuando corresponde.

## Ejemplo de uso

En el Módulo Gastos, el usuario ve debajo de las métricas dos gráficos circulares. El primero tiene dos porciones: "Cerradas (8)" y "Canceladas (3)". En el detalle del gráfico se lee "Total de operaciones: 14 (incluyendo abiertas)". El segundo gráfico tiene dos porciones: "Valor revista: $9.800.000" y "Valor real (toma): $7.200.000".

## Criterios de aceptación

- [ ] Se muestra el gráfico de torta de operaciones con las porciones "Cerradas" y "Canceladas" filtradas por el período seleccionado
- [ ] El detalle del gráfico de operaciones muestra el total general (cerradas + canceladas + abiertas) del período
- [ ] Se muestra el gráfico de torta de inventario con las porciones "Valor revista" y "Valor real (toma)"
- [ ] El gráfico de inventario no cambia al modificar el selector de período (refleja el estado actual del inventario)
- [ ] Al cambiar el período, el gráfico de operaciones se actualiza; el de inventario permanece igual
- [ ] Si no hay operaciones cerradas ni canceladas en el período, el gráfico de operaciones muestra un estado vacío o con mensaje explicativo
- [ ] Los valores monetarios del gráfico de inventario se muestran formateados en pesos argentinos
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Cuando el gráfico de operaciones recibe `cerradas: 0` y `canceladas: 0`, renderiza el estado vacío en lugar del gráfico
- [ ] El gráfico de inventario ignora el prop de período y siempre dispara su propia llamada sin parámetros de fecha
- [ ] Los labels del gráfico muestran los valores formateados (ej: "$1.200.000" en lugar de "1200000")

### Pruebas de integración

- [ ] Al cambiar el período en el selector de la página, el gráfico de operaciones realiza una nueva llamada al endpoint con las fechas actualizadas
- [ ] El gráfico de inventario realiza su llamada a `GET /api/gastos/inventario` una sola vez al montar el componente, sin re-llamar al cambiar el período
