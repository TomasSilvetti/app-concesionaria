# porcion-005 — Middleware de protección de rutas y validación de sesión [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-002

## Descripción

Implementar middleware de Next.js que protege rutas privadas validando la sesión del usuario. Redirige automáticamente al login cuando la sesión es inválida o expirada, y filtra accesos según el rol (administradores pueden acceder a todo, usuarios normales solo a rutas de su cliente).

## Ejemplo de uso

Un usuario intenta acceder a `/dashboard` sin estar autenticado. El middleware detecta que no hay sesión válida y redirige automáticamente a `/login`. Si un usuario normal intenta acceder a `/cliente/otro-id/dashboard`, el middleware lo bloquea y redirige a su propio dashboard.

## Criterios de aceptación

- [ ] El middleware valida la sesión en todas las rutas excepto `/login` y `/api/auth/*`
- [ ] Redirige a `/login` cuando no hay sesión válida
- [ ] Redirige a `/login` cuando la sesión está expirada
- [ ] Muestra mensaje "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente" después de redirección por expiración
- [ ] Los administradores pueden acceder a todas las rutas del sistema
- [ ] Los usuarios normales solo pueden acceder a rutas de su propio clienteId
- [ ] Los usuarios normales son redirigidos a su dashboard si intentan acceder a rutas de otros clientes

## Pruebas

### Pruebas unitarias

- [ ] El middleware identifica correctamente las rutas públicas que no requieren autenticación
- [ ] El middleware extrae correctamente el clienteId de la URL
- [ ] La lógica de validación de rol retorna true para administradores en cualquier ruta
- [ ] La lógica de validación de rol retorna false para usuarios normales intentando acceder a otros clientes
- [ ] El middleware construye correctamente la URL de redirección con el mensaje de sesión expirada

### Pruebas de integración

- [ ] GET a `/dashboard` sin sesión redirige a `/login`
- [ ] GET a `/dashboard` con sesión válida de administrador permite el acceso
- [ ] GET a `/cliente/123/dashboard` con sesión de usuario del cliente 123 permite el acceso
- [ ] GET a `/cliente/456/dashboard` con sesión de usuario del cliente 123 redirige a `/cliente/123/dashboard`
- [ ] GET a `/login` con sesión válida permite el acceso (no redirige)
- [ ] GET a cualquier ruta con sesión expirada redirige a `/login` con mensaje de expiración
