# porcion-033 — Botón "Buscar en stock" en formulario de operación venta stock [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-034
**Tipo:** FRONT
**Estado:** 🔄 En progreso
**Prerequisitos:** porcion-018, formulario de creación de operación

## Descripción

Agregar un botón "Buscar en stock" en el formulario de creación/edición de operación cuando el tipo seleccionado es "venta stock". Al hacer clic, se abre un modal con el listado de vehículos del stock disponibles (sin operación asociada). Al seleccionar un vehículo y confirmar, sus datos se autocompletán en los campos correspondientes del formulario de operación.

## Ejemplo de uso

El usuario crea una nueva operación y selecciona el tipo "venta stock". Aparece el botón "Buscar en stock". Hace clic en él y se abre un modal con los vehículos disponibles (no asociados a ninguna operación). Cada fila muestra marca, modelo, patente, color y km. El usuario selecciona un Toyota Corolla y hace clic en "Seleccionar". Los campos del formulario (marca, modelo, patente, color, km, precio revista, precio oferta) se autocompletan con los datos de ese vehículo.

## Criterios de aceptación

- [ ] El botón "Buscar en stock" solo aparece cuando el tipo de operación es "venta stock"
- [ ] Al hacer clic en "Buscar en stock", se abre el modal con el listado de vehículos disponibles
- [ ] Solo se muestran vehículos sin operación asociada (disponibles)
- [ ] Cada vehículo en el listado muestra: marca, modelo, patente, color, kilómetros y precio revista
- [ ] El usuario puede seleccionar un vehículo haciendo clic en él
- [ ] El vehículo seleccionado se resalta visualmente
- [ ] Hay botones "Seleccionar" y "Cancelar"
- [ ] El botón "Seleccionar" está deshabilitado si no hay vehículo seleccionado
- [ ] Al confirmar, los campos del formulario de operación se autocompletar con los datos del vehículo seleccionado
- [ ] Al hacer clic en "Cancelar", el modal se cierra sin modificar el formulario
- [ ] Si ya había un vehículo autocompletado, al seleccionar uno nuevo se reemplaza
- [ ] Mientras carga el listado de vehículos, se muestra un indicador de carga
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón "Buscar en stock" solo renderiza cuando el tipo de operación es "venta stock"
- [ ] Al abrir el modal, se realiza la llamada al endpoint de vehículos disponibles
- [ ] Al seleccionar un vehículo, el estado interno del modal se actualiza correctamente
- [ ] El botón "Seleccionar" se habilita solo cuando hay un vehículo seleccionado
- [ ] Al confirmar, los campos del formulario reciben los valores del vehículo seleccionado
- [ ] Al hacer clic en "Cancelar", el modal se cierra sin modificar los campos del formulario

### Pruebas de integración

- [ ] Al abrir el modal, se realiza una llamada GET a `/api/stock/disponibles`
- [ ] Solo se muestran vehículos sin `operacionId`
- [ ] Al seleccionar un vehículo y confirmar, los campos del formulario se autocompletan correctamente
- [ ] Al cambiar el tipo de operación a otro valor, el botón desaparece y los campos autocompletados se limpian
