# HU-4: Gestión de Stock de Vehículos

**Como** usuario de la concesionaria,
**quiero** visualizar, filtrar y gestionar el inventario de vehículos disponibles,
**para** tener control completo del stock, poder exportar catálogos para clientes y asociar vehículos a operaciones de venta.

## Descripción

El módulo de stock permite administrar el inventario completo de vehículos disponibles en la concesionaria. Los usuarios pueden ver un listado detallado de todos los vehículos, filtrarlos por múltiples criterios, ordenarlos por cualquier columna, y realizar operaciones de creación, edición y eliminación. Además, el módulo facilita la exportación de catálogos en PDF para compartir con clientes potenciales, y permite asociar vehículos del stock a operaciones de venta activas. El sistema incluye protecciones para evitar eliminar vehículos que están vinculados a operaciones, requiriendo primero desvincularlos desde la edición de la operación correspondiente.

## Criterios de aceptación

- [ ] El usuario puede ver un listado completo de todos los vehículos en stock con sus datos principales (marca, modelo, versión, color, kilómetros, precio revista, precio oferta)
- [ ] El usuario puede ordenar el listado por cualquier columna en orden ascendente o descendente haciendo clic en el encabezado de la columna
- [ ] El usuario puede filtrar vehículos por marca, categoría, rango de precio, año, kilómetros y tipo de ingreso
- [ ] El usuario puede crear un nuevo vehículo completando un formulario con todos los datos requeridos
- [ ] El sistema valida que todos los campos obligatorios estén completos antes de permitir guardar un vehículo nuevo
- [ ] El usuario puede editar la información de cualquier vehículo existente, incluso si está asociado a una operación
- [ ] El usuario puede ver los detalles completos de un vehículo incluyendo notas mecánicas y notas generales
- [ ] Al intentar eliminar cualquier vehículo, el sistema muestra una advertencia de confirmación
- [ ] Si el vehículo está asociado a una operación, el sistema impide la eliminación y muestra un mensaje indicando que debe desvincularse primero desde la edición de la operación
- [ ] El usuario puede seleccionar múltiples vehículos mediante checkboxes y exportarlos como catálogo en formato PDF
- [ ] El PDF exportado incluye fotos, marca, modelo, versión, color, kilómetros, precio revista y precio oferta (si existe) de cada vehículo seleccionado
- [ ] El usuario puede asociar un vehículo del stock a una operación activa mediante un modal que muestra las operaciones disponibles con su idOperacion y datos del vehículo principal
- [ ] Si no hay vehículos en stock, el sistema muestra un mensaje indicando que no hay vehículos y sugiere agregar el primero

## Flujos

### Flujo principal — Visualizar y gestionar stock

1. El usuario accede al módulo de stock desde el menú principal
2. El sistema muestra un listado con todos los vehículos disponibles incluyendo: marca, modelo, versión, color, kilómetros, precio revista y precio oferta
3. El usuario puede hacer clic en cualquier encabezado de columna para ordenar el listado en orden ascendente o descendente
4. El usuario puede aplicar filtros por marca, categoría, rango de precio, año, kilómetros o tipo de ingreso
5. El listado se actualiza automáticamente mostrando solo los vehículos que cumplen los criterios seleccionados
6. El usuario puede hacer clic en "Ver detalles", "Editar" o "Eliminar" en cualquier vehículo
7. El usuario puede hacer clic en "Agregar vehículo" para crear un nuevo registro

### Flujo alternativo 1 — Crear vehículo nuevo

1. El usuario hace clic en el botón "Agregar vehículo"
2. El sistema muestra un formulario con todos los campos del vehículo (versión, color, kilómetros, tipo de ingreso, notas mecánicas, notas generales, precio revista, precio oferta, fotos)
3. El usuario completa los campos obligatorios y opcionalmente los campos adicionales
4. El usuario hace clic en "Guardar"
5. Si faltan campos obligatorios, el sistema muestra mensajes de error específicos debajo de cada campo y no permite guardar
6. Si todos los datos son válidos, el sistema guarda el vehículo en el stock
7. El sistema muestra una notificación de éxito y redirige al listado actualizado

### Flujo alternativo 2 — Editar vehículo existente

1. El usuario hace clic en "Editar" en un vehículo del listado
2. El sistema muestra el formulario pre-cargado con los datos actuales del vehículo
3. El usuario modifica los campos que desea actualizar
4. El usuario hace clic en "Guardar cambios"
5. El sistema valida los datos y guarda los cambios
6. El sistema muestra una notificación de éxito y actualiza el listado

### Flujo alternativo 3 — Eliminar vehículo NO asociado a operación

1. El usuario hace clic en "Eliminar" en un vehículo que no está asociado a ninguna operación
2. El sistema muestra un diálogo de advertencia: "¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer"
3. Si el usuario hace clic en "Cancelar", el diálogo se cierra y el vehículo permanece sin cambios
4. Si el usuario hace clic en "Confirmar", el sistema elimina el vehículo del stock
5. El sistema muestra una notificación de éxito y actualiza el listado

### Flujo alternativo 4 — Eliminar vehículo asociado a operación

1. El usuario hace clic en "Eliminar" en un vehículo que está asociado a una operación
2. El sistema muestra un mensaje de advertencia: "Este vehículo está asociado a la operación OP-123. Primero debes desvincularlo desde la edición de la operación"
3. El usuario hace clic en "Aceptar" y el diálogo se cierra sin eliminar el vehículo
4. El usuario navega al módulo de operaciones y busca la operación OP-123
5. El usuario hace clic en "Editar" en la operación
6. El usuario hace clic en el botón "Desvincular vehículo" dentro del formulario de edición
7. El sistema elimina la asociación entre el vehículo y la operación
8. El usuario guarda los cambios de la operación
9. El usuario vuelve al módulo de stock
10. El usuario hace clic nuevamente en "Eliminar" en el vehículo
11. Ahora el sistema muestra la advertencia general (Flujo alternativo 3)
12. El usuario confirma y el vehículo se elimina del stock

### Flujo alternativo 5 — Exportar catálogo PDF

1. El usuario selecciona múltiples vehículos del listado usando los checkboxes junto a cada vehículo
2. El usuario hace clic en el botón "Exportar catálogo"
3. El sistema genera un archivo PDF que incluye para cada vehículo seleccionado: fotos, marca, modelo, versión, color, kilómetros, precio revista y precio oferta (si existe)
4. El sistema descarga automáticamente el PDF en el navegador del usuario
5. El usuario puede compartir el catálogo con clientes potenciales

### Flujo alternativo 6 — Asociar vehículo a operación

1. El usuario busca un vehículo específico en el listado de stock (usando filtros o búsqueda)
2. El usuario hace clic en el botón "Asociar a operación" del vehículo deseado
3. El sistema abre un modal mostrando todas las operaciones activas
4. Cada operación en el modal muestra: idOperacion, marca y modelo del vehículo principal de la operación
5. El usuario selecciona la operación a la que desea asociar el vehículo
6. El usuario hace clic en "Confirmar"
7. El sistema vincula el vehículo del stock a la operación seleccionada
8. El sistema muestra una notificación de éxito y cierra el modal

### Flujo alternativo 7 — Stock vacío

1. El usuario accede al módulo de stock por primera vez o cuando no hay vehículos registrados
2. El sistema muestra un mensaje: "No hay vehículos en stock. Agrega el primero"
3. El usuario puede hacer clic en el botón "Agregar vehículo" para crear el primer registro

## Notas técnicas

⚠️ **Base de datos:** Esta historia requiere trabajar con la tabla `Stock` existente que ya está definida en el schema de Prisma. La tabla tiene relación 1:1 con `Operation` mediante el campo `operacionId`. Para la funcionalidad de desvinculación, se deberá permitir que el campo `operacionId` pueda ser null o eliminar el registro de Stock asociado (dependiendo de la estrategia elegida: soft delete vs eliminación de asociación). 

El módulo también necesitará consultar la tabla `Operation` para mostrar las operaciones activas en el modal de asociación, y validar si un vehículo está asociado antes de permitir su eliminación.

Para la exportación de catálogos PDF, se utilizará la librería `jspdf` con `jspdf-autotable` que ya está incluida en el proyecto.

Los filtros y ordenamiento se implementarán mediante queries de Prisma con `where`, `orderBy` y los índices existentes en `clienteId` para optimizar el rendimiento.
