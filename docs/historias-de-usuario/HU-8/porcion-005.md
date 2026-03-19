# porcion-005 — Endpoints CRUD de formas de pago (PaymentMethod) [BACK]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-004

## Descripción

Crear los endpoints para listar y agregar formas de pago (`PaymentMethod`) por concesionaria. La creación valida que no exista ya un nombre igual (ignorando mayúsculas/minúsculas) para el mismo `clienteId`.

## Ejemplo de uso

El frontend hace `GET /api/payment-methods` y recibe `["Efectivo", "Transferencia"]`. Al agregar una nueva, hace `POST /api/payment-methods` con `{ "nombre": "Cheque" }`. Si ya existe "cheque" para esa concesionaria, recibe error 409. Si no existe, recibe 201 con el nuevo registro.

## Criterios de aceptación

- [ ] `GET /api/payment-methods` devuelve la lista de formas de pago del `clienteId` autenticado, ordenadas por nombre
- [ ] `POST /api/payment-methods` crea una nueva forma de pago con `nombre` y el `clienteId` del usuario autenticado
- [ ] Si ya existe una forma de pago con el mismo nombre (case-insensitive) para ese `clienteId`, devuelve error 409 con mensaje descriptivo
- [ ] El `nombre` no puede estar vacío; devuelve 400 si lo está
- [ ] Los endpoints requieren autenticación y usan el `clienteId` del usuario en sesión (no se puede crear para otro cliente)

## Pruebas

### Pruebas unitarias

- [ ] El servicio de creación normaliza el nombre a minúsculas para comparar y lanza error si ya existe
- [ ] El validador rechaza `nombre` vacío o ausente con error 400
- [ ] La función de listado filtra correctamente por `clienteId`

### Pruebas de integración

- [ ] `GET /api/payment-methods` retorna solo las formas del cliente autenticado, no las de otros clientes
- [ ] `POST /api/payment-methods` con `nombre: "Efectivo"` crea el registro y retorna 201
- [ ] `POST /api/payment-methods` con `nombre: "efectivo"` cuando ya existe "Efectivo" retorna 409
- [ ] `POST /api/payment-methods` sin autenticación retorna 401
