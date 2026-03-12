# porcion-013 — Pantalla de perfil de usuario — API de consulta [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-012
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Implementar el endpoint GET que retorna los datos del perfil del usuario autenticado, incluyendo su información básica y la relación con su cliente. El endpoint usa la sesión actual para identificar al usuario, sin necesidad de pasar un ID.

## Ejemplo de uso

El frontend llama a GET `/api/users/me` con la sesión activa. El sistema identifica al usuario desde el token JWT, consulta sus datos en la base de datos incluyendo el cliente asociado, y retorna `{ id, username, nombre, rol, cliente: { id, nombre }, activo }`.

## Criterios de aceptación

- [ ] El endpoint GET `/api/users/me` retorna los datos del usuario autenticado
- [ ] El endpoint identifica al usuario desde la sesión (no requiere pasar ID)
- [ ] La respuesta incluye: id, username, nombre, rol, activo
- [ ] La respuesta incluye el objeto cliente con id y nombre (si aplica)
- [ ] La respuesta NO incluye el campo password
- [ ] El endpoint retorna error 401 si no hay sesión válida
- [ ] El endpoint retorna 200 con los datos del usuario

## Pruebas

### Pruebas unitarias

- [ ] La función extrae correctamente el userId desde la sesión
- [ ] La query de Prisma incluye la relación con la tabla Client
- [ ] La query de Prisma excluye el campo password
- [ ] La función retorna null cuando el usuario no existe en la base de datos
- [ ] El objeto de respuesta tiene la estructura correcta con todos los campos necesarios

### Pruebas de integración

- [ ] GET `/api/users/me` con sesión válida de administrador retorna sus datos con cliente=null
- [ ] GET `/api/users/me` con sesión válida de usuario normal retorna sus datos con objeto cliente completo
- [ ] GET `/api/users/me` sin autenticación retorna error 401
- [ ] GET `/api/users/me` con sesión expirada retorna error 401
- [ ] El campo password no está presente en la respuesta
- [ ] El objeto cliente incluye id y nombre cuando el usuario tiene clienteId
