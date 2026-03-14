# porcion-007 — Endpoint de creación de operaciones — lógica [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-003, porcion-009

## Descripción

Crear el endpoint que recibe los datos del formulario de operaciones (datos completos del vehículo + datos de la operación), valida toda la información, y guarda la operación en la base de datos con todos sus campos. El endpoint debe aceptar exactamente los mismos campos del vehículo que acepta el endpoint de stock para mantener consistencia.

## Ejemplo de uso

El frontend envía un `POST /api/operations` con todos los datos del vehículo (marca, modelo, año, patente, categoría, versión, color, kilómetros, notas mecánicas, notas generales, precio revista, precio oferta, fotos) y los datos de la operación (tipo, fecha de inicio, precio de venta total, ingresos brutos, comisión). El backend valida que todos los campos obligatorios estén presentes, que el tipo de operación sea válido, que los valores numéricos sean correctos, y guarda la operación en la base de datos con todos los campos del vehículo. Responde con código 201 y los datos de la operación creada.

## Criterios de aceptación

- [ ] El endpoint `POST /api/operations` recibe todos los campos del vehículo: marcaId, modelo, anio, patente, categoriaId, version, color, kilometros, notasMecanicas, notasGenerales, precioRevista, precioOferta, fotos
- [ ] El endpoint recibe los campos específicos de la operación: tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos, comision
- [ ] El endpoint valida que todos los campos obligatorios del vehículo estén presentes (marcaId, modelo, anio, categoriaId, version, color, kilometros, precioRevista)
- [ ] El endpoint valida que todos los campos obligatorios de la operación estén presentes (tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos, comision)
- [ ] El endpoint valida que el `tipoOperacionId` sea uno de los cuatro tipos válidos del cliente
- [ ] El endpoint valida que los valores numéricos (año, kilómetros, precios) sean válidos
- [ ] El endpoint genera automáticamente un `idOperacion` único para el cliente
- [ ] El endpoint guarda la operación con estado "open" por defecto
- [ ] El endpoint guarda todos los campos del vehículo en el registro de Operation (incluyendo version, color, kilometros, notas y precios)
- [ ] El endpoint procesa y guarda las fotos del vehículo si se envían
- [ ] El endpoint calcula automáticamente los `ingresosNetos` (ingresosBrutos - comision - gastosAsociados)
- [ ] El endpoint responde con código 201 y los datos de la operación creada en caso de éxito
- [ ] El endpoint responde con código 400 y mensaje descriptivo en caso de datos inválidos
- [ ] El endpoint requiere autenticación y responde con 401 si no hay sesión válida

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta correctamente cuando falta un campo obligatorio del vehículo (marcaId, modelo, anio, categoriaId, version, color, kilometros, precioRevista)
- [ ] La función de validación detecta correctamente cuando falta un campo obligatorio de la operación (tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos, comision)
- [ ] La función de validación detecta valores numéricos fuera de rango (año < 1900, kilómetros < 0, precios <= 0)
- [ ] La función de generación de `idOperacion` crea IDs únicos para cada cliente
- [ ] La función de cálculo de `ingresosNetos` calcula correctamente el valor (ingresosBrutos - comision - gastosAsociados)
- [ ] La función de validación de tipo de operación verifica que el ID pertenezca al cliente autenticado
- [ ] La función de guardado incluye todos los campos del vehículo en el registro de Operation

### Pruebas de integración

- [ ] `POST /api/operations` sin autenticación devuelve 401
- [ ] `POST /api/operations` con datos completos y válidos (vehículo + operación) devuelve 201 y crea la operación en la BD
- [ ] `POST /api/operations` con campos obligatorios del vehículo faltantes devuelve 400 con mensaje descriptivo
- [ ] `POST /api/operations` con campos obligatorios de la operación faltantes devuelve 400 con mensaje descriptivo
- [ ] `POST /api/operations` con `tipoOperacionId` inválido devuelve 400
- [ ] `POST /api/operations` con valores numéricos inválidos devuelve 400
- [ ] La operación creada tiene estado "open" por defecto
- [ ] El `idOperacion` generado es único dentro del cliente
- [ ] Los `ingresosNetos` se calculan y guardan correctamente
- [ ] Todos los campos del vehículo (version, color, kilometros, notas, precios) se guardan correctamente en el registro de Operation
- [ ] Las fotos del vehículo se procesan y guardan correctamente si se envían
