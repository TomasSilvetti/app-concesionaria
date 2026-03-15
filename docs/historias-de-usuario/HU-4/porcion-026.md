# porcion-026 — Formulario de edición de vehículo — vista [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-027
**Tipo:** FRONT
**Prerequisitos:** porcion-024
**Estado:** completada

## Descripción

Crear el componente `EditVehicleForm` para editar un vehículo del stock. Se pre-carga con los datos actuales obtenidos via GET `/api/stock/[id]` y al guardar hace PUT a `/api/stock/[id]`. Debe reutilizar el componente `VehicleFieldsForm` (ya existente) para los campos, igual que `CreateVehicleForm`.

⚠️ **Diseño de datos actual:** El modelo es `Vehicle` (antes llamado Stock). Los campos obligatorios son: `marcaId`, `modelo`, `anio`, `categoriaId`, `version`, `color`, `kilometros`, `precioRevista`. El campo `tipoIngreso` fue eliminado del modelo y **no debe incluirse**. Los campos opcionales son: `patente`, `notasMecanicas`, `notasGenerales`, `precioOferta`, fotos.

## Ejemplo de uso

El usuario hace clic en "Editar" en un vehículo de la tabla. Se abre el formulario en `/stock/[id]/editar` con todos los campos pre-cargados con los valores actuales. El usuario cambia el precio oferta de "14000" a "13500" y hace clic en "Guardar cambios". El sistema actualiza el vehículo y muestra una notificación de éxito.

## Criterios de aceptación

- [ ] El componente `EditVehicleForm` se renderiza en la ruta `/stock/[id]/editar` (la página ya existe en `src/app/stock/[id]/editar/page.tsx`)
- [ ] Al cargar, hace GET a `/api/stock/[id]` y pre-llena todos los campos con los datos actuales del vehículo
- [ ] Incluye los mismos campos que `CreateVehicleForm`: marca (select), modelo, año, categoría (select), patente, versión, color, kilómetros, notas mecánicas, notas generales, precio revista, precio oferta, fotos
- [ ] **No incluye** campo de tipo de ingreso (eliminado del modelo)
- [ ] Los campos obligatorios son: marcaId, modelo, anio, categoriaId, version, color, kilometros, precioRevista
- [ ] El botón "Guardar cambios" está deshabilitado si hay errores de validación
- [ ] Hay un botón "Cancelar" que vuelve al listado sin guardar
- [ ] Mientras se envía el formulario, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al montar el componente, se cargan los datos del vehículo desde el endpoint
- [ ] Los campos se pre-llenan correctamente con los datos recibidos
- [ ] Al modificar un campo, el estado se actualiza correctamente
- [ ] El botón "Guardar cambios" se deshabilita si hay errores de validación
- [ ] Los mensajes de error se muestran si se vacía un campo obligatorio

### Pruebas de integración

- [ ] Al montar el componente, se realiza una llamada GET a `/api/stock/[id]`
- [ ] Al hacer clic en "Guardar cambios" con datos válidos, se realiza una llamada PUT a `/api/stock/[id]`
- [ ] Si el endpoint devuelve éxito, se muestra una notificación de éxito y se redirige al listado
- [ ] Si el endpoint devuelve error, se muestra el mensaje de error sin cerrar el formulario
- [ ] Al hacer clic en "Cancelar", se cierra el formulario sin realizar llamadas de actualización
