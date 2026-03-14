# porcion-018 — Listado de stock — vista y tabla base [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-019
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la página de stock con una tabla que muestre todos los vehículos disponibles, incluyendo las columnas principales: marca, modelo, versión, color, kilómetros, precio revista y precio oferta. La tabla debe incluir acciones por fila (ver detalles, editar, eliminar) y un botón para agregar nuevo vehículo.

## Ejemplo de uso

El usuario accede a `/stock` y ve una tabla con todos los vehículos. Cada fila muestra los datos del vehículo y tres botones de acción. En la parte superior hay un botón "Agregar vehículo". Si no hay vehículos, se muestra el mensaje "No hay vehículos en stock. Agrega el primero".

## Criterios de aceptación

- [ ] La página se renderiza en la ruta `/stock`
- [ ] La tabla muestra las columnas: marca, modelo, versión, color, kilómetros, precio revista, precio oferta y acciones
- [ ] Cada fila incluye botones "Ver detalles", "Editar" y "Eliminar"
- [ ] Hay un botón "Agregar vehículo" en la parte superior de la tabla
- [ ] Si no hay vehículos, se muestra el mensaje "No hay vehículos en stock. Agrega el primero"
- [ ] Mientras carga los datos, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza la tabla con los encabezados correctos
- [ ] El botón "Agregar vehículo" se muestra y es clickeable
- [ ] Si la lista de vehículos está vacía, se muestra el mensaje de stock vacío
- [ ] Si hay vehículos, se renderizan todas las filas con sus datos
- [ ] El indicador de carga se muestra cuando `isLoading` es true

### Pruebas de integración

- [ ] Al montar el componente, se realiza una llamada al endpoint GET `/api/stock`
- [ ] Los datos recibidos del endpoint se muestran correctamente en la tabla
- [ ] Al hacer clic en "Agregar vehículo", se navega al formulario de creación
- [ ] Al hacer clic en "Ver detalles" de un vehículo, se navega a la vista de detalles
- [ ] Al hacer clic en "Editar" de un vehículo, se navega al formulario de edición
