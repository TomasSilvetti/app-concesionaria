# porcion-004 — Selector de tipo de operación — vista [FRONT]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear el selector de tipo de operación en el formulario de operaciones que muestre únicamente los cuatro tipos específicos: "Venta desde stock", "Venta con toma de usado", "Venta 0km" y "A conseguir".

## Ejemplo de uso

El vendedor abre el formulario de nueva operación, ve el selector de tipo de operación con las cuatro opciones disponibles, selecciona "Venta con toma de usado", y el formulario registra esa selección para usarla en las validaciones posteriores.

## Criterios de aceptación

- [ ] El selector muestra únicamente las cuatro opciones: "Venta desde stock", "Venta con toma de usado", "Venta 0km", "A conseguir"
- [ ] El selector está marcado como campo obligatorio con asterisco rojo
- [ ] El selector tiene un placeholder por defecto "Seleccionar tipo de operación..."
- [ ] El selector está deshabilitado mientras se cargan los tipos de operación desde el backend
- [ ] El selector muestra un mensaje de error si no se selecciona ningún tipo al intentar guardar
- [ ] El selector tiene el mismo estilo visual que los demás selectores del sistema
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El selector renderiza las cuatro opciones de tipo de operación correctamente
- [ ] El selector muestra el placeholder cuando no hay selección
- [ ] El selector se deshabilita cuando recibe la prop `disabled={true}`
- [ ] El selector muestra el mensaje de error cuando no se selecciona ningún tipo y se valida el formulario
- [ ] El selector llama al handler de cambio cuando el usuario selecciona una opción

### Pruebas de integración

- [ ] Al cargar el formulario, el selector obtiene los tipos de operación desde el endpoint `/api/operation-types`
- [ ] Si el endpoint devuelve error, el selector muestra un mensaje indicando que no se pudieron cargar los tipos
- [ ] El valor seleccionado se incluye correctamente en el estado del formulario padre
