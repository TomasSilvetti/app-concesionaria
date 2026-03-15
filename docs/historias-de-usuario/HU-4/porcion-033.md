    # porcion-033 — Modal de asociación a operación — vista [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-034
**Tipo:** FRONT
**Prerequisitos:** porcion-018

## Descripción

Crear un modal que permita asociar un vehículo del stock a una operación activa. El modal muestra un listado de todas las operaciones activas con su idOperacion y datos del vehículo principal (marca, modelo, patente). El usuario selecciona una operación y confirma la asociación.

## Ejemplo de uso

El usuario hace clic en "Asociar a operación" en un vehículo del stock. Se abre un modal con un listado de operaciones activas. Cada operación muestra "OP-123 - Toyota Corolla ABC123". El usuario selecciona una operación y hace clic en "Confirmar". El sistema asocia el vehículo a esa operación y muestra una notificación de éxito.

## Criterios de aceptación

- [ ] Al hacer clic en "Asociar a operación" en un vehículo, se abre el modal
- [ ] El modal muestra un listado de todas las operaciones activas del cliente
- [ ] Cada operación en el listado muestra: idOperacion, marca, modelo y patente del vehículo principal
- [ ] El usuario puede seleccionar una operación haciendo clic en ella
- [ ] La operación seleccionada se resalta visualmente
- [ ] Hay botones "Confirmar" y "Cancelar"
- [ ] El botón "Confirmar" está deshabilitado si no hay operación seleccionada
- [ ] Al hacer clic en "Cancelar", el modal se cierra sin asociar
- [ ] Mientras se procesa la asociación, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al abrir el modal, se carga el listado de operaciones activas
- [ ] Al seleccionar una operación, el estado se actualiza correctamente
- [ ] El botón "Confirmar" se habilita solo cuando hay una operación seleccionada
- [ ] Al hacer clic en "Cancelar", el modal se cierra sin realizar llamadas al endpoint

### Pruebas de integración

- [ ] Al abrir el modal, se realiza una llamada GET a `/api/operations?estado=open`
- [ ] Las operaciones recibidas se muestran correctamente en el listado
- [ ] Al hacer clic en "Confirmar", se realiza una llamada PATCH a `/api/stock/[id]/asociar`
- [ ] Si el endpoint devuelve éxito, se muestra notificación de éxito, se cierra el modal y se actualiza el listado
- [ ] Si el endpoint devuelve error, se muestra el mensaje de error sin cerrar el modal
