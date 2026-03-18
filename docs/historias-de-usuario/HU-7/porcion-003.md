# porcion-003 — CRUD de gastos por operación [BACK]

**Historia de usuario:** HU-7: Módulo Gastos
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints para crear, leer, editar y eliminar gastos asociados a una operación. Incluye el endpoint de listado (con total acumulado y resumen por quién pagó precalculados) y los endpoints de mutación (POST, PUT, DELETE). Todos los endpoints requieren que la operación pertenezca al cliente del usuario autenticado.

## Ejemplo de uso

El frontend de porcion-002 llama a `GET /api/operaciones/:id/gastos` y recibe la lista de gastos, el total y el resumen por participante. Al agregar un gasto, llama a `POST /api/operaciones/:id/gastos` con `{ descripcion, quienPagoUserId, quienPagoEspecial, monto }` y recibe el gasto creado.

## Criterios de aceptación

- [ ] `GET /api/operaciones/:id/gastos` devuelve la lista de gastos de la operación con el nombre resuelto de quién pagó, el total acumulado y el resumen agrupado por participante
- [ ] `POST /api/operaciones/:id/gastos` crea un gasto con los campos `descripcion`, `quienPagoUserId` o `quienPagoEspecial`, y `monto`; devuelve el gasto creado con el nombre de quién pagó resuelto
- [ ] `PUT /api/operaciones/:id/gastos/:gastoId` actualiza los campos del gasto y devuelve el gasto actualizado
- [ ] `DELETE /api/operaciones/:id/gastos/:gastoId` elimina el gasto y devuelve confirmación
- [ ] Todos los endpoints verifican que la operación pertenece al `clienteId` del usuario autenticado (no se puede acceder a gastos de otra empresa)
- [ ] Los endpoints devuelven 404 si la operación o el gasto no existen para ese cliente
- [ ] El campo `monto` se valida como número positivo mayor a 0; `descripcion` es requerido y no vacío
- [ ] Se debe proveer exactamente uno de `quienPagoUserId` o `quienPagoEspecial = "dueno_auto"` por gasto

## Pruebas

### Pruebas unitarias

- [ ] El servicio de listado calcula correctamente el total cuando hay múltiples gastos
- [ ] El servicio de listado agrupa correctamente por quién pagó cuando varios gastos tienen el mismo participante
- [ ] La validación rechaza un gasto con `monto = 0` o `monto` negativo
- [ ] La validación rechaza un gasto donde ni `quienPagoUserId` ni `quienPagoEspecial` están presentes

### Pruebas de integración

- [ ] `POST /api/operaciones/:id/gastos` con datos válidos persiste el gasto en la base de datos y el `GET` subsiguiente lo incluye en la lista
- [ ] `DELETE /api/operaciones/:id/gastos/:gastoId` con un id de otra empresa devuelve 404 (aislamiento por cliente)
- [ ] `GET /api/operaciones/:id/gastos` sobre una operación sin gastos devuelve lista vacía, total 0 y resumen vacío
