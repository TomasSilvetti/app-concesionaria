# porcion-009 — Listado de usuarios — API de consulta [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-008
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002

## Descripción

Implementar el endpoint GET que retorna la lista de usuarios con sus datos básicos (sin contraseñas), incluyendo la relación con el cliente. Soporta filtros por rol y estado activo, y respeta el multi-tenancy (usuarios normales solo ven usuarios de su cliente, administradores ven todos).

## Ejemplo de uso

El frontend llama a GET `/api/users?rol=usuario&activo=true` y recibe un array con todos los usuarios activos de tipo "usuario", cada uno con su información básica y el nombre de su cliente asociado. Si quien consulta es un usuario normal, solo ve usuarios de su mismo cliente.

## Criterios de aceptación

- [ ] El endpoint GET `/api/users` retorna lista de usuarios sin el campo password
- [ ] Cada usuario incluye la relación con su cliente (nombre del cliente)
- [ ] El endpoint soporta query params: `rol` (admin/usuario) y `activo` (true/false)
- [ ] Los administradores reciben todos los usuarios del sistema
- [ ] Los usuarios normales solo reciben usuarios de su propio clienteId
- [ ] El endpoint retorna 200 con array vacío si no hay usuarios que cumplan los filtros
- [ ] Solo usuarios autenticados pueden acceder al endpoint
- [ ] El endpoint retorna los usuarios ordenados por fecha de creación (más recientes primero)

## Pruebas

### Pruebas unitarias

- [ ] La query de Prisma excluye el campo password del resultado
- [ ] La query de Prisma incluye la relación con la tabla Client
- [ ] El filtro por rol se aplica correctamente a la query
- [ ] El filtro por estado activo se aplica correctamente a la query
- [ ] La query de usuarios normales incluye el filtro WHERE clienteId = session.user.clienteId
- [ ] La query de administradores no incluye filtro por clienteId

### Pruebas de integración

- [ ] GET `/api/users` con sesión de administrador retorna todos los usuarios del sistema
- [ ] GET `/api/users` con sesión de usuario normal retorna solo usuarios de su cliente
- [ ] GET `/api/users?rol=admin` retorna solo usuarios con rol="admin"
- [ ] GET `/api/users?activo=false` retorna solo usuarios inactivos
- [ ] GET `/api/users?rol=usuario&activo=true` retorna solo usuarios activos de tipo "usuario"
- [ ] GET `/api/users` sin autenticación retorna error 401
- [ ] El campo password no está presente en ningún objeto de la respuesta
- [ ] Los usuarios están ordenados por creadoEn descendente
