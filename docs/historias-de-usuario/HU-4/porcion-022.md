# porcion-022 — Filtros de stock — componente de filtros [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-023
**Tipo:** FRONT
**Prerequisitos:** porcion-018
**estado:** ✅ Completada

## Descripción

Crear un componente de filtros que permita al usuario filtrar los vehículos del stock por marca, categoría, rango de precio (mínimo y máximo), año, kilómetros máximos y tipo de ingreso. Los filtros se aplican al hacer clic en un botón "Aplicar filtros" y debe haber un botón "Limpiar filtros" para resetear.

## Ejemplo de uso

El usuario ve encima de la tabla de stock un panel de filtros con campos para marca, categoría, precio mínimo, precio máximo, año, kilómetros máximos y tipo de ingreso. Selecciona "Toyota" en marca, ingresa "10000" en precio mínimo y "50000" en precio máximo, y hace clic en "Aplicar filtros". La tabla se actualiza mostrando solo vehículos Toyota en ese rango de precio.

## Criterios de aceptación

- [ ] El componente de filtros se muestra encima de la tabla de stock
- [ ] Incluye campos para: marca (select), categoría (select), precio mínimo (input numérico), precio máximo (input numérico), año (input numérico), kilómetros máximos (input numérico), tipo de ingreso (select)
- [ ] Los selects de marca y categoría se cargan dinámicamente desde los endpoints correspondientes
- [ ] Hay un botón "Aplicar filtros" que ejecuta la búsqueda con los criterios seleccionados
- [ ] Hay un botón "Limpiar filtros" que resetea todos los campos y recarga la tabla sin filtros
- [ ] Los filtros aplicados se mantienen visibles en los campos después de aplicarlos
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al cambiar un valor en un campo de filtro, el estado se actualiza correctamente
- [ ] Al hacer clic en "Aplicar filtros", se construye correctamente el objeto de filtros
- [ ] Al hacer clic en "Limpiar filtros", todos los campos vuelven a su valor inicial
- [ ] Los campos numéricos solo aceptan valores numéricos válidos

### Pruebas de integración

- [ ] Al montar el componente, se cargan las marcas y categorías desde sus respectivos endpoints
- [ ] Al hacer clic en "Aplicar filtros", se realiza una llamada al endpoint con los parámetros de query correctos
- [ ] Al hacer clic en "Limpiar filtros", se realiza una llamada al endpoint sin parámetros de filtro
- [ ] Los filtros funcionan en combinación con el ordenamiento activo
