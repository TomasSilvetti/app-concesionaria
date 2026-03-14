# porcion-010 — Formulario secundario para vehículo usado en toma de pago [FRONT]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-011
**Tipo:** FRONT
**Prerequisitos:** porcion-002

## Descripción

Crear un formulario secundario que aparezca cuando el tipo de operación es "Venta con toma de usado", permitiendo al vendedor cargar los datos completos del vehículo usado que se toma como parte de pago. Este formulario debe reutilizar el componente `VehicleFieldsForm` para mantener consistencia con el resto del sistema.

## Ejemplo de uso

El vendedor selecciona el tipo de operación "Venta con toma de usado", y aparece una sección adicional titulada "Vehículo Usado Tomado como Parte de Pago" con un botón "Añadir Vehículo Usado". Al hacer clic, se despliega el formulario completo de vehículo (usando `VehicleFieldsForm`) donde el vendedor completa todos los datos del auto usado. Una vez completado, puede guardar ese vehículo y luego proceder a guardar la operación completa.

## Criterios de aceptación

- [ ] El formulario secundario solo se muestra cuando el tipo de operación es "Venta con toma de usado"
- [ ] El formulario secundario reutiliza el componente `VehicleFieldsForm` con todos sus campos
- [ ] Hay un botón "Añadir Vehículo Usado" que despliega/colapsa el formulario secundario
- [ ] El formulario secundario tiene su propio estado independiente del vehículo principal
- [ ] Se puede añadir un solo vehículo usado por operación
- [ ] Una vez añadido el vehículo usado, se muestra un resumen con sus datos principales (marca, modelo, año, patente)
- [ ] Hay un botón "Editar" para modificar los datos del vehículo usado añadido
- [ ] Hay un botón "Eliminar" para quitar el vehículo usado y volver a empezar
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El formulario secundario se renderiza solo cuando el tipo de operación es "Venta con toma de usado"
- [ ] El formulario secundario no se muestra para otros tipos de operación
- [ ] El botón "Añadir Vehículo Usado" despliega el formulario correctamente
- [ ] El estado del vehículo usado es independiente del vehículo principal de la operación
- [ ] El resumen del vehículo usado muestra los datos correctos después de añadirlo
- [ ] El botón "Eliminar" limpia correctamente el estado del vehículo usado

### Pruebas de integración

- [ ] Al cambiar el tipo de operación a "Venta con toma de usado", el formulario secundario aparece
- [ ] Al cambiar el tipo de operación de "Venta con toma de usado" a otro tipo, el formulario secundario desaparece
- [ ] Los datos del vehículo usado se incluyen correctamente en el payload al guardar la operación
- [ ] Al añadir un vehículo usado, la validación de la porcion-008 permite guardar la operación
- [ ] Al intentar guardar sin añadir vehículo usado, la validación de la porcion-008 impide el guardado
