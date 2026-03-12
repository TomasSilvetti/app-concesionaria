# porcion-002 — Configuración de NextAuth y provider de credenciales [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-12

## Descripción

Configurar NextAuth.js con provider de credenciales para autenticación con username y password. Incluye callback de autorización que verifica estado activo del usuario, strategy JWT con duración configurable, y hasheo de contraseñas con bcrypt.

## Ejemplo de uso

Una vez configurado, cualquier componente puede usar `signIn("credentials", { username, password })` para autenticar usuarios. NextAuth valida las credenciales, verifica que el usuario esté activo, y crea una sesión JWT que expira en 7 días.

## Criterios de aceptación

- [ ] NextAuth está configurado con provider de credenciales (username + password)
- [ ] El callback de autorización valida credenciales contra la base de datos
- [ ] El sistema verifica que `activo=true` antes de permitir el acceso
- [ ] Las contraseñas se comparan usando bcrypt.compare
- [ ] La sesión usa strategy JWT con duración configurable (default 7 días)
- [ ] El objeto session incluye id, username, nombre, rol y clienteId del usuario
- [ ] Las rutas de NextAuth están expuestas en `/api/auth/*`

## Pruebas

### Pruebas unitarias

- [ ] El callback de autorización retorna null cuando las credenciales son incorrectas
- [ ] El callback de autorización retorna null cuando el usuario tiene activo=false
- [ ] El callback de autorización retorna el objeto de usuario cuando las credenciales son válidas y activo=true
- [ ] La comparación de contraseñas usa bcrypt.compare correctamente
- [ ] El objeto session contiene todos los campos necesarios (id, username, nombre, rol, clienteId)

### Pruebas de integración

- [ ] POST a `/api/auth/callback/credentials` con credenciales válidas retorna sesión exitosa
- [ ] POST a `/api/auth/callback/credentials` con credenciales inválidas retorna error 401
- [ ] POST a `/api/auth/callback/credentials` con usuario inactivo retorna error 403
- [ ] La sesión JWT se genera correctamente y puede decodificarse
- [ ] La sesión expira después del tiempo configurado
- [ ] GET a `/api/auth/session` retorna los datos del usuario autenticado
