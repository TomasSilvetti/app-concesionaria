# porcion-002 — Componente reutilizable de campos de vehículo [FRONT]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Extraer los campos comunes de vehículo (marca, modelo, año, categoría, versión, color, kilómetros, patente, notas, precios y fotos) en un componente reutilizable que pueda usarse tanto en el formulario de stock como en el de operaciones, manteniendo consistencia visual y funcional.

## Ejemplo de uso

El desarrollador importa el componente `VehicleFieldsForm` en el formulario de stock y en el de operaciones, pasándole los valores y handlers necesarios. El componente renderiza todos los campos del vehículo con validaciones y estilos consistentes en ambos contextos.

## Criterios de aceptación

- [ ] El componente `VehicleFieldsForm` expone todos los campos de vehículo: marca, modelo, año, categoría, versión, color, kilómetros, patente, notas mecánicas, notas generales, precios y fotos
- [ ] El componente recibe como props los valores de cada campo y sus funciones de actualización
- [ ] El componente recibe como props las listas de marcas y categorías disponibles
- [ ] El componente maneja y muestra los errores de validación de cada campo
- [ ] El componente incluye la lógica de drag & drop para fotos
- [ ] El componente mantiene el mismo estilo visual que el formulario de stock actual
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza todos los campos de vehículo correctamente
- [ ] El componente muestra los errores de validación en los campos correspondientes
- [ ] El componente llama a los handlers de cambio cuando el usuario modifica un campo
- [ ] El componente deshabilita todos los campos cuando recibe la prop `disabled={true}`
- [ ] La zona de drag & drop cambia su estilo visual cuando se arrastra un archivo sobre ella
- [ ] Las fotos seleccionadas se muestran en la galería con su botón de eliminar

### Pruebas de integración

- [ ] Al usar el componente en el formulario de stock, todos los campos funcionan correctamente
- [ ] Al seleccionar archivos de imagen, se crean las previsualizaciones correctamente
- [ ] Al eliminar una foto, se revoca correctamente su URL de previsualización
- [ ] Los selectores de marca y categoría muestran las opciones cargadas desde las props
