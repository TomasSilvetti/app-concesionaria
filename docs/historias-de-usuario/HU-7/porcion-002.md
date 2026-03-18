# porcion-002 — Sección gastos en operación — vista y formulario [FRONT]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completada


## Descripción

Crear la sección "Gastos" dentro del documento de una operación. Incluye la lista de gastos con sus columnas (descripción, quién pagó, monto), el formulario para agregar y editar gastos, el total acumulado al pie de la lista y el resumen agrupado por quién pagó. La sección maneja estados de carga, lista vacía y errores de forma visual.

## Ejemplo de uso

El usuario abre la operación #OP-045, navega hacia abajo hasta la sección "Gastos" y ve la lista de gastos registrados. Al final de la lista ve "Total: $85.000". Debajo aparece un resumen: "Juan: $60.000 — Dueño del auto: $25.000". Hace clic en "+ Agregar gasto", completa los campos en el formulario inline y guarda.

## Criterios de aceptación

- [ ] La sección "Gastos" es visible en el documento de cualquier operación, independientemente de su estado
- [ ] La lista muestra columnas: descripción, quién pagó y monto; con botones de editar y eliminar por fila
- [ ] Si no hay gastos, la lista muestra un estado vacío con el mensaje correspondiente y los totales muestran $0
- [ ] Al pie de la lista se muestra el total acumulado (suma de todos los montos)
- [ ] Debajo de la lista aparece el resumen agrupado por quién pagó con el subtotal de cada uno
- [ ] El formulario de agregar/editar incluye: campo de texto para descripción, selector de quién pagó e input numérico para monto
- [ ] El selector "quién pagó" muestra la lista de usuarios de la empresa más la opción fija "Dueño del auto"
- [ ] Al confirmar un gasto (agregar o editar), la lista, el total y el resumen se actualizan sin recargar la página
- [ ] Al eliminar un gasto, se muestra un diálogo de confirmación antes de proceder
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Cuando la lista de gastos está vacía, el total muestra "$0" y el resumen por participante no muestra ninguna fila
- [ ] El total acumulado se recalcula correctamente al agregar un gasto localmente (ej: lista con 2 gastos → se agrega un tercero → total es la suma de los tres)
- [ ] El resumen por participante agrupa correctamente cuando dos gastos tienen el mismo `quien_pago`
- [ ] El botón "Guardar" del formulario está deshabilitado si alguno de los campos requeridos (descripción, quién pagó, monto) está vacío o el monto es 0

### Pruebas de integración

- [ ] Al confirmar el formulario de agregar, se dispara la llamada al servicio de creación de gasto con los datos correctos y la lista se actualiza con la respuesta
- [ ] Al hacer clic en "Eliminar" y confirmar el diálogo, se llama al servicio de eliminación y el gasto desaparece de la lista
- [ ] Si el servicio devuelve error al guardar, se muestra un mensaje de error en el formulario sin cerrar el modal/formulario
