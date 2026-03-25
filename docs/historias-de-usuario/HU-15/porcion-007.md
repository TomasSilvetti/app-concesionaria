# porcion-007 — Suite de integración: Usuarios y multi-tenancy [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Crear el archivo `users.integration.test.ts` con los tests de integración para las API routes de usuarios y el aislamiento multi-tenant: creación de usuario (con y sin permisos), activación/desactivación, y verificación de que un usuario no puede ver datos de otro cliente.

## Ejemplo de uso

La suite siembra dos clientes distintos (cliente A y cliente B), cada uno con su usuario. Autenticando como usuario de cliente A, verifica que GET `/api/clients` devuelve solo el cliente A, nunca el B.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/users.integration.test.ts`
- [ ] El `beforeEach` limpia `User`, `Client` y tablas dependientes, y resiembra dos clientes con sus respectivos usuarios (uno `admin`, uno `usuario`)
- [ ] POST `/api/users` autenticado con `rol=usuario` devuelve 403
- [ ] POST `/api/users` autenticado con `rol=admin` devuelve 201 y crea el usuario en BD
- [ ] PATCH `/api/users/[id]` puede cambiar `activo` de `true` a `false` y viceversa; la BD refleja el cambio
- [ ] GET `/api/clients` autenticado como usuario del cliente A devuelve solo el cliente A, no el cliente B

## Pruebas

### Pruebas unitarias

- [ ] La lógica de autorización que rechaza a `rol=usuario` en POST `/api/users` puede verificarse aisladamente (sin BD): dado un token con `rol='usuario'`, el guard devuelve 403
- [ ] El toggle de `activo` es idempotente: aplicar PATCH con `activo: false` dos veces seguidas deja el campo en `false` (no alterna)

### Pruebas de integración

- [ ] POST `/api/users` con token `rol=usuario` → status 403, `db.user.count()` no aumenta
- [ ] POST `/api/users` con token `rol=admin` → status 201, `db.user.findUnique({ where: { username } })` devuelve el nuevo usuario con `activo: true`
- [ ] PATCH `activo: false` → `db.user.findUnique` devuelve `activo: false`; PATCH `activo: true` → devuelve `activo: true`
- [ ] GET `/api/clients` autenticado como cliente A: la lista no contiene el `id` del cliente B
- [ ] GET `/api/clients` autenticado como cliente B: la lista no contiene el `id` del cliente A (verificación simétrica del aislamiento)
