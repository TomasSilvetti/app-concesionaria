# porcion-001 — Reemplazar selects por buscador en modal "Agregar gasto" (OperationExpensesSection) [FRONT]

**Estado:** completada

**Módulo:** Operaciones
**Tipo de porción:** Fix
**Porción original:** N/A
**Prerequisitos:** Ninguno

## Descripción

En el modal "Agregar gasto" del componente `OperationExpensesSection.tsx`, los campos "Quién pagó" y "Categoría" usan un `<select>` nativo con un botón separado de "+ Agregar nuevo/nueva". Se deben reemplazar ambos campos por el patrón de buscador en tiempo real con opción de crear y opción de eliminar, idéntico al que usa `VehicleFieldsForm.tsx` para Marca y Categoría.

**Archivo a modificar:** `src/components/operations/OperationExpensesSection.tsx`

El buscador debe:
- Mostrar un input de texto con placeholder "Buscar..."
- Filtrar las opciones en tiempo real mientras el usuario escribe
- Mostrar un dropdown con los resultados filtrados
- Cada ítem del dropdown tiene un botón de eliminar (ícono de tacho) con confirmación inline (Sí / No)
- Al final del dropdown, si el texto ingresado no coincide exactamente con ninguna opción existente, mostrar la opción `+ Crear "texto"`
- Al seleccionar una opción, cerrar el dropdown y mostrar el nombre seleccionado en el input con un check verde
- Al eliminar una opción que estaba seleccionada, limpiar el campo

Los endpoints ya existen:
- GET/POST origins: `/api/operations/${operacionId}/expenses/origins`
- DELETE origin: `/api/operations/${operacionId}/expenses/origins/${id}`
- GET/POST categories: `/api/operations/${operacionId}/expenses/categories`
- DELETE category: `/api/operations/${operacionId}/expenses/categories/${id}`

## Estado actual vs estado esperado

**Hoy:** El campo "Quién pagó" es un `<select>` nativo. Para agregar una opción nueva hay que hacer clic en un botón "+ Agregar nuevo" separado que despliega un input inline. No hay forma de eliminar opciones existentes desde el modal.

**Debería:** Ambos campos ("Quién pagó" y "Categoría") muestran un input de búsqueda con dropdown filtrable. Los ítems del dropdown tienen botón de eliminar. Se puede crear una opción nueva escribiendo un nombre que no existe y seleccionando `+ Crear "..."`.

## Criterios de aceptación

- [ ] El campo "Quién pagó" muestra un input de búsqueda en lugar de un `<select>`
- [ ] El campo "Categoría" muestra un input de búsqueda en lugar de un `<select>`
- [ ] Al escribir en el input, se filtran las opciones en tiempo real
- [ ] Cada opción del dropdown tiene un botón de eliminar con confirmación inline (Sí / No)
- [ ] Al eliminar una opción, desaparece del dropdown sin recargar toda la lista
- [ ] Si la opción eliminada estaba seleccionada, el campo se limpia
- [ ] Si no hay coincidencia exacta con lo escrito, aparece `+ Crear "texto"` al final del dropdown
- [ ] Al crear una opción nueva, queda seleccionada automáticamente
- [ ] Al seleccionar una opción, el input muestra el nombre y un check verde, y el dropdown se cierra
- [ ] El dropdown se cierra al hacer clic fuera
- [ ] El estado `formOrigenId` y `formCategoriaId` se actualiza correctamente al seleccionar
- [ ] El botón "Agregar" del modal se deshabilita si no hay origen o categoría seleccionada (comportamiento existente, no romper)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al escribir "gas" en el buscador de Categoría, solo se muestran las opciones cuyo nombre contiene "gas" (case insensitive)
- [ ] Al escribir un nombre que no existe en ningún ítem, aparece la opción `+ Crear "..."` y no aparecen ítems de la lista
- [ ] Al eliminar la opción actualmente seleccionada, `formOrigenId` queda en `""`
- [ ] Al crear una opción nueva, `setOrigins` se actualiza con el nuevo ítem y `formOrigenId` queda con su id

### Pruebas de integración

- [ ] Flujo completo: abrir modal → buscar origen → seleccionar → buscar categoría → seleccionar → ingresar monto → guardar. El gasto se crea correctamente con los ids seleccionados.
- [ ] Flujo de eliminación: abrir dropdown de origen → hacer clic en eliminar → confirmar → la opción desaparece del dropdown. Luego guardar el formulario con otra opción seleccionada funciona correctamente.
