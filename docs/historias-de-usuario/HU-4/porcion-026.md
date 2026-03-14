# porcion-026 — Formulario de edición de vehículo — vista [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-027
**Tipo:** FRONT
**Prerequisitos:** porcion-024

## Descripción

Crear el formulario de edición de vehículo que se pre-carga con los datos actuales del vehículo seleccionado. El usuario puede modificar cualquier campo y guardar los cambios. El formulario debe validar campos obligatorios igual que en la creación.

## Ejemplo de uso

El usuario hace clic en "Editar" en un vehículo de la tabla. Se abre el formulario con todos los campos pre-cargados con los valores actuales. El usuario cambia el precio oferta de "14000" a "13500" y hace clic en "Guardar cambios". El sistema actualiza el vehículo y muestra una notificación de éxito.

## Criterios de aceptación

- [ ] El formulario se muestra en una ruta `/stock/[id]/editar` o en un modal
- [ ] Al cargar, todos los campos se pre-llenan con los datos actuales del vehículo
- [ ] El usuario puede modificar cualquier campo
- [ ] Los campos obligatorios siguen siendo obligatorios
- [ ] El botón "Guardar cambios" está deshabilitado si hay errores de validación
- [ ] Hay un botón "Cancelar" que cierra el formulario sin guardar
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
