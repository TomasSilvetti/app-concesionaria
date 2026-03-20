# porcion-010 — Botón y modal "Agregar gasto" en el Módulo Gastos [FRONT]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-011
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-19
**Prerequisitos:** porcion-008

## Descripción

Agregar un botón "Agregar gasto" en el encabezado de la tabla "Listado de Gastos" del Módulo Gastos. Al hacer clic, se abre el modal de agregar gasto ya existente (el mismo que se usa en el documento de una operación), pero configurado para crear un gasto libre: sin operación asociada. Al confirmar, el gasto se persiste y la tabla se actualiza automáticamente.

## Ejemplo de uso

El usuario está en el Módulo Gastos. En el encabezado de la tabla "Listado de Gastos" ve un botón "Agregar gasto". Lo presiona, se abre el modal con los campos descripción, quién pagó, categoría y monto. Completa los datos y hace clic en "Agregar". El modal se cierra, la tabla muestra el nuevo gasto y las métricas del módulo se actualizan.

## Criterios de aceptación

- [ ] En el encabezado de la tabla "Listado de Gastos" aparece un botón "Agregar gasto"
- [ ] Al hacer clic en el botón se abre el modal de agregar gasto (reutilizando el componente existente)
- [ ] El modal no tiene ningún campo pre-cargado de operación (el gasto es libre, sin operación asociada)
- [ ] Al confirmar en el modal, el gasto se crea llamando al endpoint correspondiente (porcion-011)
- [ ] Tras crear el gasto exitosamente, el modal se cierra y la tabla se refresca mostrando el nuevo registro
- [ ] La fila del nuevo gasto en la tabla muestra el campo "ID Operación" vacío o con un indicador visual que señala que no está asociado a ninguna operación
- [ ] Si el endpoint devuelve error, el modal muestra un mensaje de error sin cerrarse
- [ ] El botón y el modal son responsive y se visualizan correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al hacer clic en el botón "Agregar gasto", el estado que controla la visibilidad del modal cambia a `true`
- [ ] Al confirmar el formulario, se llama al servicio con `operacionId: null` (o sin ese campo)
- [ ] Tras la respuesta exitosa del servicio, se invoca el refetch de la tabla

### Pruebas de integración

- [ ] Al hacer clic en "Agregar" con los campos válidos, se realiza la llamada a `POST /api/gastos` sin `operacionId` y el nuevo gasto aparece en la tabla
- [ ] Si el servidor responde con error 400/500, el modal permanece abierto y muestra el mensaje de error
