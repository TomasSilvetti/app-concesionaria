# porcion-002 — Tablero Kanban: layout visual de columnas y tarjetas [FRONT]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-003
**Estado:** completada
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la pantalla del tablero kanban con columnas dispuestas horizontalmente, cada una mostrando sus tarjetas apiladas verticalmente. Incluye el botón para agregar una nueva columna, el botón "Agregar" dentro de cada columna para crear tarjetas, y el encabezado de columna con nombre y opción de renombrar/eliminar. Los datos se cargan desde la API; en esta porción se establece la estructura visual y el estado de carga/vacío.

## Ejemplo de uso

El usuario navega al módulo de Pendientes y ve tres columnas por defecto: "Buscando", "En negociación" y "Listo para entregar". Cada columna muestra sus tarjetas con título y nombre del creador. Al final de todas las columnas aparece el botón "+ Agregar columna".

## Criterios de aceptación

- [ ] Las columnas se muestran en fila horizontal con scroll horizontal si superan el ancho de pantalla
- [ ] Cada columna muestra su nombre en el encabezado y un menú (o botones) para renombrar y eliminar
- [ ] Cada tarjeta en la columna muestra el título y el nombre del usuario creador
- [ ] Existe un botón "+ Agregar" dentro de cada columna para crear tarjetas
- [ ] Existe un botón "+ Agregar columna" al final del tablero
- [ ] Se muestra un estado de carga mientras se obtienen los datos de la API
- [ ] Si no hay columnas, se muestra un mensaje de estado vacío con el botón para crear la primera columna
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Con datos de prueba, se renderizan correctamente N columnas con sus tarjetas
- [ ] Una columna sin tarjetas muestra el estado vacío de la columna (sin tarjetas) y el botón "Agregar"
- [ ] El estado de carga muestra un skeleton o spinner en lugar del contenido
- [ ] El botón "+ Agregar columna" está visible y es clickeable

### Pruebas de integración

- [ ] Al montar el componente, se realiza la llamada a la API para obtener columnas y tarjetas del cliente
- [ ] Si la API devuelve error, se muestra un mensaje de error en pantalla
- [ ] Las tarjetas recibidas de la API se agrupan y muestran bajo la columna correcta
