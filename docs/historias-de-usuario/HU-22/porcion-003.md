# porcion-003 — Reemplazar select por buscador en modal "Registrar pago" (PaymentModal) [FRONT]

**Módulo:** Operaciones
**Tipo de porción:** Fix
**Porción original:** N/A
**Prerequisitos:** Ninguno
**Estado:** 🔄 En progreso
**estado**: completada

## Descripción

En el modal "Registrar pago" (`PaymentModal.tsx`), el campo "Forma de pago" usa un `<select>` nativo con un botón "+ Agregar" separado. Se debe reemplazar por el buscador en tiempo real con opción de crear y opción de eliminar.

**Archivo a modificar:** `src/components/operations/PaymentModal.tsx`

El buscador debe comportarse igual al patrón de `VehicleFieldsForm.tsx`:
- Input de texto con placeholder "Buscar forma de pago..."
- Filtrado en tiempo real
- Dropdown con los resultados; cada ítem tiene botón de eliminar con confirmación inline
- Opción `+ Crear "texto"` al final si no hay coincidencia exacta
- Al seleccionar, mostrar nombre + check verde y cerrar el dropdown

Los endpoints ya existen:
- GET/POST: `/api/payment-methods`
- DELETE: `/api/payment-methods/${id}`

Nota: el estado de `loadingMethods` debe seguir funcionando — mientras carga, mostrar el input deshabilitado con spinner (como hoy).

## Estado actual vs estado esperado

**Hoy:** El campo "Forma de pago" es un `<select>` nativo (con spinner mientras carga). Para agregar una nueva forma de pago hay un botón "+ Agregar" separado que despliega un input inline. No se pueden eliminar formas de pago desde el modal.

**Debería:** El campo "Forma de pago" es un buscador con dropdown filtrable. Los ítems tienen botón de eliminar. Se puede crear una nueva forma de pago escribiendo un nombre nuevo. Mientras carga, el input aparece deshabilitado con indicador visual.

## Criterios de aceptación

- [ ] El campo "Forma de pago" muestra un input de búsqueda en lugar de un `<select>`
- [ ] Mientras `loadingMethods` es true, el input aparece deshabilitado con un spinner visible
- [ ] Al escribir, las opciones se filtran en tiempo real (case insensitive)
- [ ] Cada opción del dropdown tiene un botón de eliminar con confirmación inline (Sí / No)
- [ ] Al eliminar una opción, desaparece del dropdown sin recargar la lista completa
- [ ] Si la opción eliminada estaba seleccionada, `metodoPagoId` se limpia
- [ ] Si no hay coincidencia exacta con lo escrito, aparece `+ Crear "texto"` al final del dropdown
- [ ] Al crear una forma de pago nueva, queda seleccionada automáticamente y se agrega a la lista local
- [ ] Al seleccionar una opción, el input muestra el nombre con check verde y el dropdown se cierra
- [ ] El dropdown se cierra al hacer clic fuera
- [ ] El botón "Guardar" sigue deshabilitado si no hay `metodoPagoId` seleccionado (comportamiento existente, no romper)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al escribir "efec" en el buscador, solo aparecen las formas de pago cuyo nombre contiene "efec"
- [ ] Al escribir un nombre inexistente, aparece `+ Crear "..."` y la lista de resultados queda vacía
- [ ] Al eliminar la forma de pago seleccionada, `metodoPagoId` queda en `""`
- [ ] Al crear una nueva forma de pago, `paymentMethods` se actualiza con el nuevo ítem ordenado y `metodoPagoId` queda con su id

### Pruebas de integración

- [ ] Flujo completo: abrir modal → buscar y seleccionar forma de pago → ingresar monto → guardar. El pago se registra correctamente con el `metodoPagoId` seleccionado.
- [ ] Flujo de eliminación: abrir dropdown → eliminar una forma de pago → confirmar → desaparece. Luego seleccionar otra y guardar funciona correctamente.
