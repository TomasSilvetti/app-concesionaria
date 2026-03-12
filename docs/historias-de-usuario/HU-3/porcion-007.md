# porcion-007 — Formulario de creación de usuario — API y validaciones [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Implementar el endpoint POST que recibe los datos del formulario de creación de usuario, valida que el username sea único, hashea la contraseña con bcrypt, valida que usuarios normales tengan cliente asignado, y crea el registro en la base de datos con activo=true por defecto.

## Ejemplo de uso

El formulario envía `{ username: "jperez", nombre: "Juan Pérez", password: "mipass123", rol: "usuario", clienteId: "abc123" }` al endpoint POST `/api/users`. El sistema valida que "jperez" no exista, hashea la contraseña, crea el usuario vinculado al cliente abc123, y retorna el usuario creado con status 201.

## Criterios de aceptación

- [ ] El endpoint POST `/api/users` recibe username, nombre, password, rol y clienteId opcional
- [ ] El sistema valida que el username no esté duplicado antes de crear
- [ ] El sistema retorna error 409 si el username ya existe
- [ ] El sistema valida que si rol="usuario", el clienteId sea obligatorio
- [ ] El sistema retorna error 400 si rol="usuario" y clienteId es null
- [ ] La contraseña se hashea con bcrypt antes de almacenarse
- [ ] El usuario se crea con activo=true por defecto
- [ ] El endpoint retorna el usuario creado (sin el password) con status 201
- [ ] Solo usuarios con rol="admin" pueden acceder a este endpoint

## Pruebas

### Pruebas unitarias

- [ ] La función de validación detecta usernames duplicados correctamente
- [ ] La función de hasheo usa bcrypt con salt rounds adecuado (mínimo 10)
- [ ] La validación de rol retorna error cuando rol="usuario" y clienteId es null
- [ ] La validación de rol permite clienteId null cuando rol="admin"
- [ ] El objeto de respuesta no incluye el campo password

### Pruebas de integración

- [ ] POST `/api/users` con datos válidos crea el usuario y retorna 201
- [ ] POST `/api/users` con username duplicado retorna error 409
- [ ] POST `/api/users` con rol="usuario" y sin clienteId retorna error 400
- [ ] POST `/api/users` con rol="admin" y sin clienteId crea el usuario exitosamente
- [ ] La contraseña se almacena hasheada en la base de datos (no en texto plano)
- [ ] POST `/api/users` sin autenticación retorna error 401
- [ ] POST `/api/users` con usuario no-admin retorna error 403
- [ ] El usuario creado puede iniciar sesión inmediatamente con sus credenciales
