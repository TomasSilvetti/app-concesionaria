# porcion-007 — Filtros de operaciones — UI [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-008
**Tipo:** FRONT
**Prerequisitos:** porcion-003
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear la interfaz de filtros para el listado de operaciones. Incluye selectores/inputs para filtrar por estado, rango de fechas, marca y tipo de operación. Los filtros se aplican al hacer clic en "Aplicar filtros" y se pueden limpiar con un botón "Limpiar filtros".

## Ejemplo de uso

El usuario ve encima de la tabla de operaciones una barra de filtros con: un selector de estado (abierta/cerrada/cancelada), un selector de rango de fechas (desde-hasta), un selector de marca y un selector de tipo de operación. Selecciona "Estado: cerrada" y "Marca: Toyota", hace clic en "Aplicar filtros" y la tabla se actualiza mostrando solo las operaciones cerradas de Toyota.

## Criterios de aceptación

- [ ] La barra de filtros muestra un selector de estado con opciones: Todas, Abierta, Cerrada, Cancelada
- [ ] La barra de filtros muestra un selector de rango de fechas (fecha desde y fecha hasta)
- [ ] La barra de filtros muestra un selector de marca que carga las marcas del cliente desde el backend
- [ ] La barra de filtros muestra un selector de tipo de operación que carga los tipos desde el backend
- [ ] Hay un botón "Aplicar filtros" que dispara la búsqueda con los filtros seleccionados
- [ ] Hay un botón "Limpiar filtros" que resetea todos los filtros y recarga el listado completo
- [ ] Los filtros aplicados se muestran visualmente (ej: badges con los filtros activos)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza todos los selectores de filtros correctamente
- [ ] El botón "Aplicar filtros" está deshabilitado si no hay ningún filtro seleccionado
- [ ] El botón "Limpiar filtros" resetea el estado de todos los filtros
- [ ] Los selectores de marca y tipo de operación se populan correctamente con los datos del backend

### Pruebas de integración

- [ ] Al hacer clic en "Aplicar filtros", se dispara una petición al backend con los query params correctos
- [ ] Al hacer clic en "Limpiar filtros", se dispara una petición al backend sin query params de filtros
- [ ] Los filtros aplicados persisten al hacer scroll infinito (las nuevas páginas respetan los filtros)
- [ ] Si se cambia un filtro y se aplica, el listado se reinicia desde la primera página
