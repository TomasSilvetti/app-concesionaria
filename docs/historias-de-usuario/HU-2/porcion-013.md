# porcion-013 — Documento de operación — vista completa [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-014
**Tipo:** FRONT
**Prerequisitos:** porcion-001

## Descripción

Crear la página de documento de operación que muestra TODA la información de una operación en modo solo lectura. Incluye datos del vehículo, fechas, información financiera, estado, tipo de operación, lista de vehículos de intercambio (si los hay) y lista de gastos asociados. Tiene un botón "Editar" para cambiar a modo edición.

## Ejemplo de uso

El usuario hace clic en el idOperacion de una fila del listado. Se abre una página que muestra toda la información de la operación organizada en secciones: "Datos del vehículo" (marca, modelo, año, patente, categoría), "Fechas" (inicio, venta, días de venta calculados), "Información financiera" (precio venta, ingresos brutos, gastos asociados, ganancia neta, comisión), "Estado y tipo", "Vehículos de intercambio" (tabla con los vehículos tomados) y "Gastos asociados" (tabla con los gastos vinculados). Arriba hay un botón "Editar".

## Criterios de aceptación

- [ ] La página muestra el idOperacion como título o identificador principal
- [ ] La página muestra una sección "Datos del vehículo" con: marca, modelo, año, patente, categoría
- [ ] La página muestra una sección "Fechas" con: fechaInicio, fechaVenta, diasVenta (calculado si fechaVenta existe)
- [ ] La página muestra una sección "Información financiera" con: precioVentaTotal, ingresosBrutos, gastosAsociados, ingresosNetos, comision (todos formateados como moneda o porcentaje)
- [ ] La página muestra el estado como badge con color y el tipo de operación
- [ ] Si la operación tiene vehículos de intercambio, muestra una tabla con: marca, modelo, año, patente, precio negociado
- [ ] Si la operación tiene gastos asociados, muestra una tabla con: fecha, descripción, categoría, monto
- [ ] Hay un botón "Editar" que navega a la misma página en modo edición
- [ ] Hay un botón "Volver" que regresa al listado de operaciones
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza correctamente todas las secciones cuando recibe datos completos
- [ ] El componente calcula correctamente diasVenta cuando fechaVenta existe
- [ ] El componente muestra "Sin vehículos de intercambio" cuando el array está vacío
- [ ] El componente muestra "Sin gastos asociados" cuando el array está vacío
- [ ] Los valores financieros se formatean correctamente como moneda

### Pruebas de integración

- [ ] Al cargar la página con un idOperacion válido, se dispara GET /operations/:id
- [ ] Si el backend devuelve la operación, se renderiza correctamente con todos los datos
- [ ] Si el backend devuelve 404, se muestra un mensaje de error "Operación no encontrada"
- [ ] Al hacer clic en "Editar", navega a /operations/:id/edit
- [ ] Al hacer clic en "Volver", navega a /operations
