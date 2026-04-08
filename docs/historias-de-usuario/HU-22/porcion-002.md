# porcion-002 — Reemplazar selects por buscador en modal "Agregar gasto" (GastosTabla — módulo Finanzas) [FRONT]

**Módulo:** Finanzas
**Tipo de porción:** Fix
**Porción original:** N/A
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-04-08

## Descripción

En el componente `GastosTabla.tsx` (módulo Finanzas), el modal "Agregar gasto" también usa `<select>` nativos con botones "+ Agregar nuevo/nueva" para los campos "Quién pagó" y "Categoría". Se aplica el mismo reemplazo que en porcion-001, pero sobre este componente que consume endpoints distintos (sin `operacionId`).

**Archivo a modificar:** `src/components/gastos/GastosTabla.tsx`

El buscador debe comportarse exactamente igual que en porcion-001. Los endpoints que usa este componente son:
- GET/POST origins: `/api/gastos/origins`
- DELETE origin: `/api/gastos/origins/${id}`
- GET/POST categories: `/api/gastos/categories`
- DELETE category: `/api/gastos/categories/${id}`

## Estado actual vs estado esperado

**Hoy:** Los campos "Quién pagó" y "Categoría" en el modal de GastosTabla son `<select>` nativos con botones separados para agregar nuevas opciones. No hay forma de eliminar opciones existentes.

**Debería:** Ambos campos muestran un buscador en tiempo real con dropdown filtrable, botón de eliminar en cada ítem y opción de crear si el texto no coincide con ninguna opción existente.

## Criterios de aceptación

- [ ] El campo "Quién pagó" muestra un input de búsqueda en lugar de un `<select>`
- [ ] El campo "Categoría" muestra un input de búsqueda en lugar de un `<select>`
- [ ] Al escribir en el input, se filtran las opciones en tiempo real
- [ ] Cada opción del dropdown tiene un botón de eliminar con confirmación inline (Sí / No)
- [ ] Al eliminar una opción, desaparece del dropdown sin recargar toda la lista
- [ ] Si la opción eliminada estaba seleccionada, el campo se limpia
- [ ] Si no hay coincidencia exacta, aparece `+ Crear "texto"` al final del dropdown
- [ ] Al crear una opción nueva, queda seleccionada automáticamente
- [ ] Al seleccionar una opción, el input muestra el nombre con check verde y el dropdown se cierra
- [ ] El dropdown se cierra al hacer clic fuera
- [ ] El botón "Agregar" del modal se deshabilita si no hay origen o categoría seleccionada (comportamiento existente, no romper)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al escribir en el buscador de "Quién pagó", las opciones se filtran correctamente por nombre (case insensitive)
- [ ] Al escribir un nombre que no existe, aparece `+ Crear "..."` y desaparecen los ítems que no coinciden
- [ ] Al eliminar la opción seleccionada actualmente, `formOrigenId` queda en `""`
- [ ] Al crear una nueva categoría, se agrega a la lista local y queda seleccionada

### Pruebas de integración

- [ ] Flujo completo en módulo Finanzas: abrir modal → buscar y seleccionar origen → buscar y seleccionar categoría → ingresar monto → guardar. El gasto se persiste correctamente.
- [ ] Verificar que los cambios en GastosTabla no afectan el modal de OperationExpensesSection (son componentes independientes).
