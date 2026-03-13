# porcion-016 — Endpoint PATCH /operations/:id — actualizar operación [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-015
**Tipo:** BACK
**Prerequisitos:** porcion-014
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear el endpoint PATCH /operations/:id que actualiza los campos editables de una operación existente. Valida que la operación pertenezca al cliente autenticado, valida los campos modificados, recalcula automáticamente ganancia neta y comisión si cambiaron ingresosBrutos o gastosAsociados, y actualiza el registro en la base de datos.

## Ejemplo de uso

El frontend envía PATCH /operations/clg1x2y3z4 con el payload: { fechaVenta: "2026-03-20", ingresosBrutos: 29000, estado: "cerrada" }. El backend valida que la operación pertenezca al cliente, valida los campos, recalcula ingresosNetos y comision, actualiza la operación en la BD y devuelve 200 OK con la operación actualizada.

## Criterios de aceptación

- [ ] El endpoint requiere autenticación (token JWT válido)
- [ ] El endpoint valida que la operación pertenezca al clienteId del usuario autenticado
- [ ] El endpoint acepta campos opcionales para actualizar: fechaInicio, fechaVenta, modelo, anio, patente, precioVentaTotal, ingresosBrutos, estado, marcaId, categoriaId, tipoOperacionId
- [ ] El endpoint valida que fechaVenta no sea anterior a fechaInicio (si ambos están presentes)
- [ ] El endpoint valida que anio sea un número entre 1900 y año actual + 1 (si se proporciona)
- [ ] El endpoint valida que precioVentaTotal e ingresosBrutos sean positivos (si se proporcionan)
- [ ] Si se modifica ingresosBrutos, el endpoint recalcula automáticamente ingresosNetos y comision
- [ ] El campo gastosAsociados NO es editable desde este endpoint (se actualiza automáticamente desde el módulo de Gastos)
- [ ] Si todo es válido, actualiza la operación y devuelve 200 OK con la operación actualizada
- [ ] Si la operación no existe o no pertenece al cliente, devuelve 404 Not Found
- [ ] Si hay errores de validación, devuelve 400 Bad Request con detalles

## Pruebas

### Pruebas unitarias

- [ ] El servicio valida correctamente que la operación pertenezca al cliente
- [ ] El servicio valida correctamente que fechaVenta no sea anterior a fechaInicio
- [ ] El servicio recalcula correctamente ingresosNetos cuando se actualiza ingresosBrutos
- [ ] El servicio recalcula correctamente comision cuando cambia ingresosNetos
- [ ] El servicio construye correctamente el objeto de actualización de Prisma con solo los campos proporcionados

### Pruebas de integración

- [ ] PATCH /operations/:id sin token devuelve 401 Unauthorized
- [ ] PATCH /operations/:id con token válido y datos válidos devuelve 200 OK y actualiza la operación
- [ ] PATCH /operations/:id con id inexistente devuelve 404 Not Found
- [ ] PATCH /operations/:id con id de operación de otro cliente devuelve 404 Not Found
- [ ] PATCH /operations/:id con fechaVenta anterior a fechaInicio devuelve 400 Bad Request
- [ ] Si se actualiza ingresosBrutos, los campos ingresosNetos y comision se recalculan correctamente en la BD
- [ ] Solo los campos enviados en el payload se actualizan, los demás permanecen sin cambios
