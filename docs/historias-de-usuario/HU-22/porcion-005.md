# porcion-005 — Verificación de regresión [REGRESION]

**Módulo:** Operaciones / Finanzas
**Tipo de porción:** Regresión
**Porción original:** N/A
**Prerequisitos:** porcion-001, porcion-002, porcion-003, porcion-004

## Descripción

Verificación manual de que el fix no introdujo nuevos errores en los flujos existentes de los módulos Operaciones y Finanzas.

## Pasos de verificación

### Flujos del módulo Operaciones — Modal "Agregar gasto"

1. Abrir una operación en modo edición → ir al módulo de gastos → hacer clic en "Agregar"
2. Verificar que el campo "Quién pagó" muestra un input de búsqueda (no un `<select>`)
3. Verificar que el campo "Categoría" muestra un input de búsqueda (no un `<select>`)
4. Escribir en el campo "Quién pagó" → verificar que los resultados se filtran en tiempo real
5. Seleccionar un origen → verificar que aparece el nombre con check verde y el dropdown se cierra
6. Abrir el dropdown de "Quién pagó" → hacer clic en el ícono de eliminar de un ítem → aparece confirmación (Sí / No) → hacer clic en "No" → el ítem permanece
7. Repetir paso 6 pero hacer clic en "Sí" → el ítem desaparece del dropdown
8. Completar todos los campos y hacer clic en "Agregar" → el gasto se crea y aparece en la tabla
9. Editar un gasto existente → verificar que los campos "Quién pagó" y "Categoría" muestran el buscador con el valor actual pre-seleccionado
10. Guardar los cambios de edición → verificar que se actualizan correctamente

### Flujos del módulo Finanzas — Modal "Agregar gasto"

1. Ir al módulo Finanzas → abrir el modal "Agregar gasto"
2. Verificar que el campo "Quién pagó" muestra un input de búsqueda
3. Verificar que el campo "Categoría" muestra un input de búsqueda
4. Crear una nueva opción de origen escribiendo un nombre inexistente → seleccionar `+ Crear "..."` → la opción queda seleccionada automáticamente
5. Completar el formulario y guardar → el gasto se crea correctamente en el módulo Finanzas

### Flujos del módulo Operaciones — Modal "Registrar pago"

1. Abrir una operación → hacer clic en "Registrar pago"
2. Verificar que el campo "Forma de pago" muestra un input de búsqueda (no un `<select>`)
3. Verificar que mientras carga muestra el estado de carga (input deshabilitado con spinner)
4. Una vez cargado, escribir en el buscador → los resultados se filtran
5. Crear una nueva forma de pago → queda seleccionada automáticamente
6. Eliminar una forma de pago → confirmar → desaparece
7. Seleccionar otra forma de pago, ingresar monto y guardar → el pago se registra correctamente
8. Verificar que el saldo pendiente de la operación se actualiza

### Flujos del módulo Operaciones — Formulario de edición (Marca y Categoría)

1. Abrir una operación en modo edición → ir a la sección "Datos del Vehículo"
2. Hacer clic en el input de Marca → abrir el dropdown → verificar que cada ítem tiene un ícono de eliminar
3. Eliminar una marca (que no esté en uso en esta operación) → confirmar → la marca desaparece
4. Ir al módulo Stock → crear un vehículo nuevo → verificar que la marca eliminada ya no aparece en el buscador de Stock
5. Volver al formulario de edición de operación → sección de vehículos de parte → verificar que los dropdowns de Marca y Categoría también tienen botones de eliminar
6. Guardar la operación → verificar que todos los datos se persisten correctamente

### Verificación cruzada de entidades globales

1. Eliminar una marca desde el formulario de edición de operación → ir a Stock → verificar que esa marca tampoco aparece allí
2. Eliminar una categoría de vehículo desde el formulario → verificar lo mismo en Stock
3. Eliminar un origen de gasto desde el modal de Operaciones → ir a Finanzas → verificar que ese origen tampoco aparece en el modal de Finanzas (si comparten la misma tabla)

## Resultado esperado

Si todos los pasos anteriores se comportan correctamente, el fix está completo y no introdujo regresiones.

**Una vez verificado, marcar esta porción como completada.**
