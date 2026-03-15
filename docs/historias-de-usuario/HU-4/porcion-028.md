# porcion-028 — Vista de detalles de vehículo — componente [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-029
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completado

## Descripción

Crear la vista de detalles de vehículo en `/stock/[id]` que muestre toda la información del vehículo seleccionado obtenida desde GET `/api/stock/[id]`.

⚠️ **Diseño de datos actual:** El modelo es `Vehicle`. Los campos a mostrar son: `marca` (via VehicleBrand), `modelo`, `anio`, `categoria` (via VehicleCategory), `patente`, `version`, `color`, `kilometros`, `notasMecanicas`, `notasGenerales`, `precioRevista`, `precioOferta`, `estado`, fotos (via VehiclePhoto). **No hay campo `tipoIngreso`**. Si el vehículo tiene `operacionId`, la operación asociada expone su `idOperacion`; el vehículo vendido de la operación (`vehiculoVendidoId`) es un `Vehicle` con su propia `marca`, `modelo` y `patente`.

## Ejemplo de uso

El usuario hace clic en "Ver detalles" en un vehículo de la tabla. Se abre la vista `/stock/[id]` con toda la información organizada en secciones: Datos básicos (marca, modelo, año, categoría, patente, versión, color, kilómetros), Precios (revista, oferta), Notas (mecánicas, generales), Fotos, y si está asociado a una operación, muestra el `idOperacion` y los datos del vehículo vendido de esa operación.

## Criterios de aceptación

- [ ] La vista se renderiza en la ruta `/stock/[id]`
- [ ] Muestra todos los campos del vehículo organizados en secciones: Datos básicos, Precios, Notas, Fotos
- [ ] **No muestra** campo de tipo de ingreso (eliminado del modelo)
- [ ] Si el vehículo tiene `operacionId`, muestra los datos de la operación asociada: `idOperacion` y marca/modelo/patente del vehículo vendido en esa operación
- [ ] Si el vehículo no tiene operación asociada, muestra "Sin operación asociada"
- [ ] Las fotos se muestran en una galería navegable
- [ ] Hay botones "Editar" (navega a `/stock/[id]/editar`) y "Volver al listado" (navega a `/stock`)
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
