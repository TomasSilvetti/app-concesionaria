# porcion-002 — Layout del dashboard y selector de período global [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-04-09

## Descripción

Construir la estructura visual del dashboard de métricas con título, descripción y el selector de período global (semana, mes actual, mes anterior, año, rango personalizado). El período seleccionado se mantiene como estado compartido que todas las secciones del dashboard consumirán.

## Ejemplo de uso

El usuario entra a `/metricas` y ve el encabezado "Métricas" con el selector de período en la parte superior. Por defecto está seleccionado "Mes actual". Al cambiar a "Año", todas las secciones del dashboard (KPIs, gráficos, tabla) recibirán el nuevo rango de fechas.

## Criterios de aceptación

- [ ] La página muestra un encabezado con título "Métricas"
- [ ] El selector de período aparece en la parte superior con las opciones: Semana, Mes actual, Mes anterior, Año, Rango personalizado
- [ ] El período por defecto al cargar la página es "Mes actual"
- [ ] La opción "Rango personalizado" habilita dos inputs de fecha (desde / hasta)
- [ ] El estado del período seleccionado está disponible para todas las secciones del dashboard
- [ ] El layout organiza las secciones en el orden correcto: KPIs → Aging de deuda → Rotación → Cobros → ROI
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El selector inicia con "Mes actual" seleccionado por defecto
- [ ] Al seleccionar "Rango personalizado", los inputs de fecha aparecen visibles
- [ ] Al seleccionar cualquier opción distinta a "Rango personalizado", los inputs de fecha se ocultan
- [ ] El estado del período expone correctamente los valores `desde` y `hasta` como fechas ISO

### Pruebas de integración

- [ ] Al cambiar la opción del selector, el valor del período propagado hacia las secciones hijas se actualiza correctamente
- [ ] Al ingresar un rango personalizado válido (desde < hasta), el estado refleja las fechas ingresadas
- [ ] Al ingresar un rango personalizado inválido (desde > hasta), se muestra un mensaje de error y no se propaga el cambio
