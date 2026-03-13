# porcion-003 — Tabla de operaciones con columnas principales [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-004
**Tipo:** FRONT
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear la tabla que muestra el listado de operaciones con las columnas principales: idOperacion (clickeable), fechaInicio, fechaVenta, modelo, año, marca, estado, precioVentaTotal, ganancia neta y botón de editar. La tabla consume los datos del endpoint y los renderiza con formato apropiado.

## Ejemplo de uso

El usuario ve una tabla con todas sus operaciones. Cada fila muestra: el ID de operación (en azul y clickeable), las fechas, el modelo del vehículo, el año, la marca, un badge de color según el estado (verde para "abierta", gris para "cerrada", rojo para "cancelada"), el precio de venta formateado como moneda, la ganancia neta, y un ícono de lápiz para editar.

## Criterios de aceptación

- [ ] La tabla muestra las columnas: idOperacion, fechaInicio, fechaVenta, modelo, año, marca, estado, precioVentaTotal, ingresosNetos
- [ ] El idOperacion es clickeable y navega al documento de operación
- [ ] Las fechas se muestran en formato legible (ej: "15/03/2026")
- [ ] El estado se muestra como badge con color: verde (abierta), gris (cerrada), rojo (cancelada)
- [ ] Los precios se formatean como moneda (ej: "$25.000,00")
- [ ] Cada fila tiene un botón/ícono "Editar" que navega al documento en modo edición
- [ ] Si no hay operaciones, muestra un mensaje "No hay operaciones registradas"
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza correctamente cuando recibe un array vacío (muestra mensaje de "sin operaciones")
- [ ] El componente renderiza correctamente cuando recibe un array con operaciones
- [ ] Las fechas se formatean correctamente usando la función de formato
- [ ] Los precios se formatean correctamente como moneda
- [ ] El badge de estado muestra el color correcto según el valor del estado

### Pruebas de integración

- [ ] Al hacer clic en un idOperacion, navega a /operations/:id
- [ ] Al hacer clic en el botón "Editar", navega a /operations/:id/edit
- [ ] La tabla se actualiza correctamente cuando cambian los datos del listado
