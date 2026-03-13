# porcion-012 — Endpoint POST /operations — crear con vehículos de intercambio [BACK]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-011
**Tipo:** BACK
**Prerequisitos:** porcion-010

## Descripción

Extender el endpoint POST /operations para soportar la creación de operaciones con vehículos de intercambio. Cuando el payload incluye un array de vehículos de intercambio, el endpoint crea la operación principal, luego crea un registro de Stock por cada vehículo de intercambio con tipoIngreso "intercambio", y finalmente crea los registros en OperationExchange vinculando cada stock a la operación. Todo en una transacción.

## Ejemplo de uso

El frontend envía POST /operations con los datos de la operación más un campo vehiculosIntercambio: [{ marca, modelo, año, patente, version, color, kilometros, precioNegociado, notasMecanicas, notasGenerales }]. El backend crea la operación, luego por cada vehículo crea un Stock y un OperationExchange, todo dentro de una transacción de Prisma. Si algo falla, se hace rollback completo.

## Criterios de aceptación

- [ ] El endpoint acepta un campo opcional "vehiculosIntercambio" en el payload (array de objetos)
- [ ] Cada objeto de vehiculosIntercambio debe tener: marcaId, modelo, anio, patente, precioNegociado (requeridos) y version, color, kilometros, notasMecanicas, notasGenerales (opcionales)
- [ ] El endpoint valida que cada vehículo de intercambio tenga los campos requeridos
- [ ] El endpoint crea la operación principal primero
- [ ] Por cada vehículo de intercambio, el endpoint crea un registro en Stock con tipoIngreso = "intercambio" y operacionId = id de la operación creada
- [ ] Por cada Stock creado, el endpoint crea un registro en OperationExchange vinculando operacionId, stockId y precioNegociado
- [ ] Todo el proceso (operación + stocks + exchanges) se ejecuta en una transacción de Prisma
- [ ] Si alguna parte falla, se hace rollback completo y no se crea nada
- [ ] Si todo es válido, devuelve 201 Created con la operación creada incluyendo los vehiculosIntercambiados poblados
- [ ] Si hay errores de validación, devuelve 400 Bad Request con detalles

## Pruebas

### Pruebas unitarias

- [ ] El servicio valida correctamente que cada vehículo de intercambio tenga los campos requeridos
- [ ] El servicio construye correctamente los datos para crear Stock con tipoIngreso "intercambio"
- [ ] El servicio construye correctamente los datos para crear OperationExchange
- [ ] El servicio ejecuta todo dentro de una transacción de Prisma (prisma.$transaction)

### Pruebas de integración

- [ ] POST /operations con vehiculosIntercambio válidos crea la operación, los stocks y los exchanges correctamente
- [ ] POST /operations con vehiculosIntercambio con campos faltantes devuelve 400 Bad Request
- [ ] Si falla la creación de un Stock, se hace rollback y no se crea la operación (transacción atómica)
- [ ] La operación creada incluye la relación vehiculosIntercambiados correctamente poblada en la respuesta
- [ ] Los Stock creados tienen el operacionId correcto y tipoIngreso = "intercambio"
- [ ] Los OperationExchange creados vinculan correctamente operacionId, stockId y precioNegociado
