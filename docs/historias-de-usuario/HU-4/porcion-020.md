# porcion-020 — Ordenamiento por columnas en tabla de stock [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-021
**Tipo:** FRONT
**Prerequisitos:** porcion-018
**estado:** ✅ Completada

## Descripción

Agregar funcionalidad de ordenamiento a la tabla de stock. Al hacer clic en el encabezado de cualquier columna, la tabla se reordena por esa columna en orden ascendente. Si se vuelve a hacer clic, cambia a orden descendente. Se debe mostrar un indicador visual (flecha) del ordenamiento activo.

## Ejemplo de uso

El usuario ve la tabla de stock y hace clic en el encabezado "Marca". La tabla se reordena alfabéticamente por marca de A a Z y aparece una flecha hacia arriba junto a "Marca". Si hace clic nuevamente, la tabla se reordena de Z a A y la flecha cambia hacia abajo.

## Criterios de aceptación

- [ ] Todos los encabezados de columna son clickeables
- [ ] Al hacer clic en un encabezado, la tabla se reordena por esa columna en orden ascendente
- [ ] Al hacer clic nuevamente en el mismo encabezado, el orden cambia a descendente
- [ ] Se muestra un indicador visual (flecha ↑ o ↓) junto al encabezado de la columna activa
- [ ] Solo una columna puede tener ordenamiento activo a la vez
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al hacer clic en un encabezado, el estado de ordenamiento se actualiza correctamente
- [ ] La flecha de ordenamiento se muestra solo en la columna activa
- [ ] Al cambiar de columna, la flecha anterior desaparece y aparece en la nueva columna
- [ ] El toggle entre ascendente y descendente funciona correctamente

### Pruebas de integración

- [ ] Al hacer clic en "Marca", se realiza una llamada al endpoint con `orderBy=marca&order=asc`
- [ ] Al hacer clic nuevamente en "Marca", se realiza una llamada con `orderBy=marca&order=desc`
- [ ] Los datos devueltos por el endpoint se muestran en el orden correcto en la tabla
- [ ] El ordenamiento se mantiene al aplicar filtros
