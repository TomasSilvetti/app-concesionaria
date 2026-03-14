# porcion-007 — Endpoint de creación de operaciones — lógica [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-003, HU-6 (refactorización del modelo de vehículos)
**Estado:** ⏸️ Pausada (esperando HU-6)

## Descripción

Crear el endpoint que recibe los datos del formulario de operaciones (datos completos del vehículo + datos de la operación), valida toda la información, crea primero el vehículo en la tabla `Vehicle` con estado "en_proceso", y luego crea la operación referenciando ese vehículo mediante `vehiculoVendidoId`. El endpoint debe aceptar exactamente los mismos campos del vehículo que acepta el endpoint de stock para mantener consistencia.

## Ejemplo de uso

El frontend envía un `POST /api/operations` con todos los datos del vehículo (marca, modelo, año, patente, categoría, versión, color, kilómetros, notas mecánicas, notas generales, precio revista, precio oferta, fotos) y los datos de la operación (tipo, fecha de inicio, precio de venta total, ingresos brutos). El backend:
1. Crea un registro en `Vehicle` con todos los datos del vehículo y `estado = "en_proceso"`
2. Procesa y guarda las fotos del vehículo en `VehiclePhoto` asociadas al vehículo creado
3. Calcula automáticamente la comisión a partir de ingresos brutos y precio de venta
4. Crea el registro de `Operation` con `vehiculoVendidoId` apuntando al vehículo creado
5. Responde con código 201 y los datos de la operación creada (incluyendo los datos del vehículo mediante JOIN)

## Criterios de aceptación

- [ ] El endpoint `POST /api/operations` recibe todos los campos del vehículo: marcaId, modelo, anio, patente, categoriaId, version, color, kilometros, notasMecanicas, notasGenerales, precioRevista, precioOferta, fotos
- [ ] El endpoint recibe los campos específicos de la operación: tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos
- [ ] El endpoint crea primero un registro en `Vehicle` con todos los datos del vehículo y `estado = "en_proceso"`
- [ ] El endpoint procesa y guarda las fotos en `VehiclePhoto` asociadas al vehículo creado
- [ ] El endpoint calcula automáticamente la comisión a partir de ingresosBrutos y precioVentaTotal
- [ ] El endpoint valida que todos los campos obligatorios del vehículo estén presentes (marcaId, modelo, anio, categoriaId, version, color, kilometros, precioRevista)
- [ ] El endpoint valida que todos los campos obligatorios de la operación estén presentes (tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos)
- [ ] El endpoint valida que el `tipoOperacionId` sea uno de los cuatro tipos válidos del cliente
- [ ] El endpoint valida que los valores numéricos (año, kilómetros, precios) sean válidos
- [ ] El endpoint genera automáticamente un `idOperacion` único para el cliente
- [ ] El endpoint crea el registro de `Operation` con `vehiculoVendidoId` apuntando al vehículo creado y estado "open" por defecto
- [ ] El endpoint calcula automáticamente los `ingresosNetos` (ingresosBrutos - comision - gastosAsociados)
- [ ] La creación del vehículo y la operación se realiza en una transacción (si falla uno, se revierte todo)
- [ ] El endpoint responde con código 201 y los datos de la operación creada (incluyendo los datos del vehículo mediante include) en caso de éxito
- [ ] El endpoint responde con código 400 y mensaje descriptivo en caso de datos inválidos
- [ ] El endpoint requiere autenticación y responde con 401 si no hay sesión válida

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta correctamente cuando falta un campo obligatorio del vehículo (marcaId, modelo, anio, categoriaId, version, color, kilometros, precioRevista)
- [ ] La función de validación detecta correctamente cuando falta un campo obligatorio de la operación (tipoOperacionId, fechaInicio, precioVentaTotal, ingresosBrutos)
- [ ] La función de validación detecta valores numéricos fuera de rango (año < 1900, kilómetros < 0, precios <= 0)
- [ ] La función de generación de `idOperacion` crea IDs únicos para cada cliente
- [ ] La función de cálculo de comisión calcula correctamente el valor a partir de ingresosBrutos y precioVentaTotal
- [ ] La función de cálculo de `ingresosNetos` calcula correctamente el valor (ingresosBrutos - comision - gastosAsociados)
- [ ] La función de validación de tipo de operación verifica que el ID pertenezca al cliente autenticado
- [ ] La función de creación de vehículo asigna correctamente `estado = "en_proceso"`

### Pruebas de integración

- [ ] `POST /api/operations` sin autenticación devuelve 401
- [ ] `POST /api/operations` con datos completos y válidos (vehículo + operación) devuelve 201 y crea tanto el vehículo como la operación en la BD
- [ ] `POST /api/operations` con campos obligatorios del vehículo faltantes devuelve 400 con mensaje descriptivo
- [ ] `POST /api/operations` con campos obligatorios de la operación faltantes devuelve 400 con mensaje descriptivo
- [ ] `POST /api/operations` con `tipoOperacionId` inválido devuelve 400
- [ ] `POST /api/operations` con valores numéricos inválidos devuelve 400
- [ ] El vehículo creado tiene `estado = "en_proceso"` y NO aparece en el listado de stock disponible
- [ ] La operación creada tiene estado "open" por defecto y `vehiculoVendidoId` apuntando al vehículo creado
- [ ] El `idOperacion` generado es único dentro del cliente
- [ ] La comisión se calcula automáticamente a partir de ingresosBrutos y precioVentaTotal
- [ ] Los `ingresosNetos` se calculan y guardan correctamente (ingresosBrutos - comision - gastosAsociados)
- [ ] Todos los campos del vehículo se guardan correctamente en el registro de `Vehicle`
- [ ] Las fotos del vehículo se guardan en `VehiclePhoto` asociadas al vehículo creado
- [ ] Si falla la creación del vehículo o la operación, toda la transacción se revierte (rollback)
- [ ] Al consultar la operación creada con `include: { VehiculoVendido: true }`, se obtienen todos los datos del vehículo
