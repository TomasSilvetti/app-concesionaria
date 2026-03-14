# porcion-028 — Vista de detalles de vehículo — componente [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-029
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la vista de detalles de vehículo que muestre toda la información del vehículo seleccionado, incluyendo versión, color, kilómetros, tipo de ingreso, notas mecánicas, notas generales, precios, fotos, y datos de la operación asociada si existe.

## Ejemplo de uso

El usuario hace clic en "Ver detalles" en un vehículo de la tabla. Se abre una vista con toda la información del vehículo organizada en secciones: Datos básicos (versión, color, kilómetros), Precios (revista, oferta), Notas (mecánicas, generales), Fotos, y si está asociado a una operación, muestra el ID de operación y datos del vehículo principal.

## Criterios de aceptación

- [ ] La vista se muestra en una ruta `/stock/[id]` o en un modal
- [ ] Muestra todos los campos del vehículo organizados en secciones
- [ ] Si el vehículo tiene `operacionId`, muestra los datos de la operación asociada (idOperacion, marca, modelo del vehículo principal)
- [ ] Si el vehículo no tiene operación asociada, muestra "Sin operación asociada"
- [ ] Las fotos se muestran en una galería navegable
- [ ] Hay botones "Editar" y "Volver al listado"
- [ ] Mientras carga los datos, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza todas las secciones de información
- [ ] Si hay fotos, se muestra la galería de fotos
- [ ] Si no hay fotos, se muestra un mensaje "Sin fotos"
- [ ] Si hay operación asociada, se muestra la sección de operación
- [ ] Si no hay operación asociada, se muestra "Sin operación asociada"

### Pruebas de integración

- [ ] Al montar el componente, se realiza una llamada GET a `/api/stock/[id]`
- [ ] Los datos recibidos del endpoint se muestran correctamente en todas las secciones
- [ ] Al hacer clic en "Editar", se navega al formulario de edición
- [ ] Al hacer clic en "Volver al listado", se navega a la página de stock
