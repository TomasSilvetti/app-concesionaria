# porcion-011 — Activar/desactivar usuario — API y invalidación de sesiones [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-010
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-002, porcion-005
**Estado:** ✅ Completada
**Completada el:** 2026-03-12

## Descripción

Implementar el endpoint PATCH que actualiza el campo activo de un usuario. Cuando se desactiva un usuario, el sistema invalida todas sus sesiones activas para que no pueda seguir usando el sistema. Solo administradores pueden ejecutar esta acción.

## Ejemplo de uso

El frontend envía PATCH `/api/users/abc123` con body `{ activo: false }`. El sistema actualiza el campo activo del usuario, invalida sus sesiones JWT activas, y retorna el usuario actualizado. Si ese usuario intenta hacer cualquier acción, el middleware lo redirige al login.

## Criterios de aceptación

- [ ] El endpoint PATCH `/api/users/[id]` recibe el campo activo (true/false)
- [ ] El sistema actualiza el campo activo en la base de datos
- [ ] Cuando activo cambia a false, el sistema invalida todas las sesiones activas de ese usuario
- [ ] El endpoint retorna el usuario actualizado con status 200
- [ ] El endpoint retorna error 404 si el userId no existe
- [ ] Solo usuarios con rol="admin" pueden acceder a este endpoint
- [ ] El endpoint retorna error 403 si un usuario no-admin intenta usarlo
- [ ] El sistema no permite que un administrador se desactive a sí mismo

## Pruebas

### Pruebas unitarias

- [ ] La función de actualización modifica correctamente el campo activo en la base de datos
- [ ] La función de invalidación de sesiones identifica todas las sesiones del usuario
- [ ] La validación de permisos retorna error cuando el usuario no es administrador
- [ ] La validación de auto-desactivación retorna error cuando el admin intenta desactivarse a sí mismo
- [ ] El objeto de respuesta no incluye el campo password

### Pruebas de integración

- [ ] PATCH `/api/users/[id]` con activo=false actualiza el usuario y retorna 200
- [ ] PATCH `/api/users/[id]` con activo=false invalida las sesiones activas del usuario
- [ ] Después de desactivar, el usuario no puede acceder a rutas protegidas (middleware lo bloquea)
- [ ] PATCH `/api/users/[id]` con activo=true reactiva el usuario exitosamente
- [ ] PATCH `/api/users/invalid-id` retorna error 404
- [ ] PATCH `/api/users/[id]` sin autenticación retorna error 401
- [ ] PATCH `/api/users/[id]` con usuario no-admin retorna error 403
- [ ] PATCH `/api/users/[own-id]` con activo=false (admin desactivándose a sí mismo) retorna error 400
