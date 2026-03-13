# porcion-013 ? Pantalla de perfil de usuario ? API de consulta [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticaci?n y Gesti?n de Usuarios
**Par:** porcion-012
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002
**Estado:** ? Completada
**Completada el:** 2026-03-13

## Descripci?n

Implementar el endpoint GET que retorna los datos del perfil del usuario autenticado, incluyendo su informaci?n b?sica y la relaci?n con su cliente. El endpoint usa la sesi?n actual para identificar al usuario, sin necesidad de pasar un ID.

## Ejemplo de uso

El frontend llama a GET `/api/users/me` con la sesi?n activa. El sistema identifica al usuario desde el token JWT, consulta sus datos en la base de datos incluyendo el cliente asociado, y retorna `{ id, username, nombre, rol, cliente: { id, nombre }, activo }`.

## Criterios de aceptaci?n

- [ ] El endpoint GET `/api/users/me` retorna los datos del usuario autenticado
- [ ] El endpoint identifica al usuario desde la sesi?n (no requiere pasar ID)
- [ ] La respuesta incluye: id, username, nombre, rol, activo
- [ ] La respuesta incluye el objeto cliente con id y nombre (si aplica)
- [ ] La respuesta NO incluye el campo password
- [ ] El endpoint retorna error 401 si no hay sesi?n v?lida
- [ ] El endpoint retorna 200 con los datos del usuario

## Pruebas

### Pruebas unitarias

- [ ] La funci?n extrae correctamente el userId desde la sesi?n
- [ ] La query de Prisma incluye la relaci?n con la tabla Client
- [ ] La query de Prisma excluye el campo password
- [ ] La funci?n retorna null cuando el usuario no existe en la base de datos
- [ ] El objeto de respuesta tiene la estructura correcta con todos los campos necesarios

### Pruebas de integraci?n

- [ ] GET `/api/users/me` con sesi?n v?lida de administrador retorna sus datos con cliente=null
- [ ] GET `/api/users/me` con sesi?n v?lida de usuario normal retorna sus datos con objeto cliente completo
- [ ] GET `/api/users/me` sin autenticaci?n retorna error 401
- [ ] GET `/api/users/me` con sesi?n expirada retorna error 401
- [ ] El campo password no est? presente en la respuesta
- [ ] El objeto cliente incluye id y nombre cuando el usuario tiene clienteId
