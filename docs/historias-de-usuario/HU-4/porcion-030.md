# porcion-030 — Eliminación con validación — diálogo y lógica [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-031
**Tipo:** FRONT
**Estado:** completada
**Prerequisitos:** Ninguno

## Descripción

Implementar la funcionalidad de eliminación de vehículos con diálogo de confirmación. Al hacer clic en "Eliminar", se muestra una advertencia. Si el vehículo está asociado a una operación, se muestra un mensaje específico impidiendo la eliminación y sugiriendo desvincularlo primero desde la edición de la operación.

## Ejemplo de uso

El usuario hace clic en "Eliminar" en un vehículo. Aparece un diálogo: "¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer". Si el usuario confirma, el vehículo se elimina. Si el vehículo está asociado a una operación, el diálogo muestra: "Este vehículo está asociado a la operación OP-123. Primero debes desvincularlo desde la edición de la operación" y solo hay botón "Aceptar".

## Criterios de aceptación

- [ ] Al hacer clic en "Eliminar", se abre un diálogo de confirmación
- [ ] Si el vehículo NO está asociado a operación, el diálogo muestra advertencia genérica con botones "Cancelar" y "Confirmar"
- [ ] Si el vehículo SÍ está asociado a operación, el diálogo muestra mensaje específico con el ID de la operación y solo botón "Aceptar"
- [ ] Al hacer clic en "Cancelar", el diálogo se cierra sin eliminar
- [ ] Al hacer clic en "Confirmar", se realiza la llamada de eliminación al endpoint
- [ ] Mientras se procesa la eliminación, se muestra un indicador de carga
- [ ] Si la eliminación es exitosa, se muestra notificación de éxito y se actualiza el listado
- [ ] Si la eliminación falla, se muestra el mensaje de error del endpoint
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al hacer clic en "Eliminar", el diálogo se abre
- [ ] El mensaje del diálogo cambia según si el vehículo tiene operación asociada
- [ ] Al hacer clic en "Cancelar", el diálogo se cierra sin realizar llamadas al endpoint
- [ ] Al hacer clic en "Confirmar", se dispara la llamada DELETE al endpoint

### Pruebas de integración

- [ ] Al hacer clic en "Confirmar" en un vehículo sin operación, se realiza DELETE a `/api/stock/[id]`
- [ ] Si el endpoint devuelve status 200, se muestra notificación de éxito y el vehículo desaparece del listado
- [ ] Si el endpoint devuelve error 400 (vehículo asociado), se muestra el mensaje de error en el diálogo
- [ ] Al hacer clic en "Eliminar" en un vehículo asociado, el diálogo muestra el mensaje de protección con el ID de la operación
