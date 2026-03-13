# porcion-010 — Endpoint POST /operations — crear operación simple [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-009
**Tipo:** BACK
**Prerequisitos:** porcion-002

## Descripción

Crear el endpoint POST /operations que recibe los datos de una nueva operación simple, valida los campos requeridos, calcula automáticamente ganancia neta y comisión, y crea el registro en la base de datos asociado al cliente autenticado.

## Ejemplo de uso

El frontend envía POST /operations con el payload: fechaInicio, modelo, año, patente, precioVentaTotal, ingresosBrutos, marcaId, categoriaId, tipoOperacionId. El backend valida los datos, extrae el clienteId del token, calcula ingresosNetos = ingresosBrutos - gastosAsociados (0 inicialmente) y comision, crea la operación con estado "open" y devuelve 201 Created con la operación creada.

## Criterios de aceptación

- [ ] El endpoint requiere autenticación (token JWT válido)
- [ ] El endpoint valida que todos los campos requeridos estén presentes: fechaInicio, modelo, anio, patente, precioVentaTotal, ingresosBrutos, marcaId, categoriaId, tipoOperacionId
- [ ] El endpoint valida que fechaInicio sea una fecha válida
- [ ] El endpoint valida que anio sea un número entre 1900 y el año actual + 1
- [ ] El endpoint valida que precioVentaTotal e ingresosBrutos sean números positivos
- [ ] El endpoint valida que marcaId, categoriaId y tipoOperacionId existan en la base de datos y pertenezcan al cliente
- [ ] El endpoint calcula automáticamente: ingresosNetos = ingresosBrutos - gastosAsociados (0 por defecto)
- [ ] El endpoint calcula automáticamente: comision = ((ingresosNetos - ingresosBrutos) / ingresosBrutos) * 100
- [ ] El endpoint crea la operación con estado "open" por defecto
- [ ] El endpoint asocia la operación al clienteId del usuario autenticado
- [ ] Si todo es válido, devuelve 201 Created con la operación creada
- [ ] Si hay errores de validación, devuelve 400 Bad Request con detalles de los errores

## Pruebas

### Pruebas unitarias

- [ ] El servicio valida correctamente que todos los campos requeridos estén presentes
- [ ] El servicio valida correctamente el rango del campo año
- [ ] El servicio valida correctamente que los precios sean positivos
- [ ] El servicio calcula correctamente ingresosNetos e comision
- [ ] El servicio asigna correctamente el estado "open" por defecto

### Pruebas de integración

- [ ] POST /operations sin token devuelve 401 Unauthorized
- [ ] POST /operations con datos válidos devuelve 201 Created y crea la operación en la BD
- [ ] POST /operations con campos faltantes devuelve 400 Bad Request con errores específicos
- [ ] POST /operations con marcaId inexistente devuelve 400 Bad Request
- [ ] POST /operations con marcaId de otro cliente devuelve 400 Bad Request (validación multi-tenant)
- [ ] La operación creada tiene el clienteId correcto del usuario autenticado
- [ ] Los cálculos de ingresosNetos y comision son correctos en la operación creada
