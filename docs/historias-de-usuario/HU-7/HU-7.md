# HU-7: Módulo Gastos

**Como** usuario de la concesionaria,
**quiero** registrar los gastos asociados a cada operación y visualizar un resumen financiero consolidado,
**para** tener control sobre los costos por operación y conocer la rentabilidad real del negocio en cualquier período.

---

## Descripción

El módulo de gastos tiene dos superficies:

1. **Sección dentro del documento de una operación:** permite registrar, editar y eliminar los gastos asociados a esa operación. Muestra una lista de gastos con descripción, quién pagó y monto; el total acumulado al pie de la lista; y un resumen de cuánto gastó cada participante (agrupado por el campo "quién pagó").

2. **Módulo Gastos (página independiente):** muestra métricas financieras del período seleccionado (default: último mes), dos gráficos de torta y una tabla de todos los gastos de todas las operaciones con filtros.

### Campos de un gasto
- **Descripción** (texto libre)
- **Quién pagó** (selección de la lista de usuarios de la empresa + opción "Dueño del auto")
- **Monto** (numérico)

---

## Criterios de aceptación

### Sección de gastos en la operación

- [ ] CA-1: La sección "Gastos" es visible dentro del documento de cada operación, independientemente de su estado.
- [ ] CA-2: El usuario puede agregar un gasto completando los campos descripción, quién pagó y monto; el gasto queda persistido en la base de datos asociado a esa operación.
- [ ] CA-3: El usuario puede editar y eliminar cualquier gasto de la lista.
- [ ] CA-4: Al pie de la lista de gastos se muestra el total acumulado (suma de todos los montos de esa operación).
- [ ] CA-5: Debajo de la lista se muestra un resumen agrupado por "quién pagó" con el subtotal de cada uno.
- [ ] CA-6: Si no hay gastos registrados, la lista aparece vacía y los totales muestran $0.
- [ ] CA-7: El campo "quién pagó" ofrece como opciones los usuarios de la empresa más la opción fija "Dueño del auto".
- [ ] CA-8: Al agregar, editar o eliminar un gasto, la lista, el total acumulado y el resumen por participante se actualizan inmediatamente sin recargar la página.

### Módulo Gastos (página)

- [ ] CA-9: El módulo es accesible desde el menú de navegación principal.
- [ ] CA-10: Por defecto, el período seleccionado es el último mes; el usuario puede modificarlo con un selector de rango de fechas.
- [ ] CA-11: Al cambiar el período, todas las métricas, gráficos e indicadores se recalculan para ese rango.
- [ ] CA-12: Se muestra la métrica **Total vendido bruto** = suma de los precios de venta total de todas las operaciones cerradas en el período.
- [ ] CA-13: Se muestra la métrica **Total gastado** = suma de todos los gastos asociados a operaciones cerradas en el período.
- [ ] CA-14: Se muestra la métrica **Ganancia** = Total vendido bruto − total precio de toma − Total gastado (operaciones cerradas del período).
- [ ] CA-15: Se muestra un **gráfico de torta de operaciones** con las porciones: operaciones cerradas y operaciones canceladas (del período). En el detalle del gráfico se indica además el total de operaciones (cerradas + canceladas + abiertas).
- [ ] CA-16: Se muestra un **gráfico de torta de inventario** con las porciones: valor revista del inventario (suma de precios de revista de vehículos disponibles + en operación abierta) y valor real del inventario (suma de precios de toma de vehículos disponibles + en operación abierta). Este gráfico no se filtra por período (refleja el estado actual del inventario).
- [ ] CA-17: Se muestra el indicador **Plata por cobrar** = suma de la ganancia neta de todas las operaciones en estado abierto (sin filtro de período).
- [ ] CA-18: La tabla de gastos muestra todos los gastos de todas las operaciones con las columnas: operación (ID/referencia), descripción, quién pagó, monto y fecha.
- [ ] CA-19: La tabla de gastos cuenta con filtros por: período (sincronizado con el selector global), operación, y quién pagó.
- [ ] CA-20: Todas las métricas e indicadores se recalculan automáticamente cuando se registra, edita o elimina un gasto en cualquier operación.

---

## Flujos

### Flujo principal — Registrar gasto y ver impacto en métricas

1. El usuario abre el documento de una operación.
2. Navega a la sección "Gastos" dentro del documento.
3. Hace clic en "Agregar gasto".
4. Completa descripción, selecciona quién pagó de la lista y carga el monto.
5. Confirma → el gasto se persiste y la lista, el total acumulado y el resumen por participante se actualizan.
6. El usuario navega al módulo Gastos desde el menú.
7. Visualiza las métricas, gráficos e indicadores actualizados con el nuevo gasto incluido.

### Flujo alternativo 1 — Cambio de período en el módulo Gastos

1. El usuario accede al módulo Gastos (período por defecto: último mes).
2. Selecciona un rango de fechas personalizado en el selector de período.
3. Todas las métricas (total vendido bruto, total gastado, ganancia) y los gráficos de operaciones se recalculan para el nuevo rango.
4. La tabla de gastos se filtra automáticamente al mismo período.

### Flujo alternativo 2 — Sin gastos en la operación

1. El usuario abre el documento de una operación que no tiene gastos.
2. La sección "Gastos" muestra la lista vacía, total acumulado $0 y el resumen por participante vacío.

### Flujo alternativo 3 — Editar o eliminar un gasto existente

1. El usuario accede a la sección "Gastos" de una operación.
2. Hace clic en editar (o eliminar) sobre un gasto de la lista.
3. Modifica los campos y confirma (o confirma la eliminación).
4. La lista y todos los totales se actualizan inmediatamente.

---

## Notas técnicas

⚠️ **Base de datos:**
- Nueva tabla `gastos` con campos: `id`, `operacion_id` (FK), `descripcion`, `quien_pago` (FK a usuarios o valor fijo "dueño del auto"), `monto`, `fecha_creacion`, `fecha_actualizacion`.
- La opción "Dueño del auto" puede modelarse como un valor especial en `quien_pago` (ej: string fijo `"dueno_auto"` o un usuario virtual).

⚠️ **Cálculo de métricas:**
- **Total vendido bruto:** `SUM(precio_venta_total)` de operaciones con `estado = 'cerrada'` y `fecha_cierre` dentro del período.
- **Total precio de toma:** `SUM(precio_toma)` de los vehículos de esas operaciones.
- **Total gastado:** `SUM(gastos.monto)` de gastos asociados a esas operaciones cerradas.
- **Ganancia:** Total vendido bruto − Total precio de toma − Total gastado.
- **Plata por cobrar:** `SUM(ganancia_neta)` de operaciones con `estado = 'abierta'` (sin filtro de período).

⚠️ **Inventario (gráfico):**
- Vehículos a incluir: `estado = 'disponible'` + vehículos que pertenecen a una operación con `estado = 'abierta'` (independiente del período seleccionado).
- Valor revista = `SUM(precio_revista)` de ese conjunto.
- Valor real = `SUM(precio_toma)` de ese conjunto.

⚠️ **Gráfico de torta de operaciones:**
- Filtrado por período seleccionado.
- Porciones: operaciones cerradas / operaciones canceladas.
- Detalle del gráfico: también muestra el total general (cerradas + canceladas + abiertas) del período.

⚠️ **Reactividiad:** los cálculos de métricas del módulo Gastos deben actualizarse ante cambios en gastos, cambios de estado de operaciones o modificaciones de precios de venta/toma.
