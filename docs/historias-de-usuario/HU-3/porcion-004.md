# porcion-004 — Pantalla de login — lógica de autenticación [BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-003
**Tipo:** BACK
**Prerequisitos:** porcion-002

## Descripción

Implementar la lógica de autenticación que conecta el formulario de login con NextAuth, valida credenciales, verifica estado activo del usuario, y redirige según el rol (administrador al dashboard global, usuario normal al dashboard de su cliente).

## Ejemplo de uso

Cuando el usuario completa el formulario y hace clic en "Iniciar sesión", el sistema valida las credenciales, verifica que el usuario esté activo, crea la sesión JWT, y redirige automáticamente: los administradores van a `/dashboard` y los usuarios normales van a `/cliente/[id]/dashboard`.

## Criterios de aceptación

- [ ] La función de login recibe username y password desde el formulario
- [ ] El sistema valida las credenciales usando NextAuth signIn
- [ ] El sistema retorna error 401 cuando las credenciales son incorrectas
- [ ] El sistema retorna error 403 cuando el usuario tiene activo=false
- [ ] Después de login exitoso, el sistema redirige a `/dashboard` si rol="admin"
- [ ] Después de login exitoso, el sistema redirige a `/cliente/[clienteId]/dashboard` si rol="usuario"
- [ ] La sesión se crea con duración de 7 días por defecto

## Pruebas

### Pruebas unitarias

- [ ] La función de login llama a signIn con los parámetros correctos
- [ ] La función de login retorna error cuando signIn falla
- [ ] La lógica de redirección selecciona la ruta correcta según el rol del usuario
- [ ] La función maneja correctamente el caso de usuario null o undefined

### Pruebas de integración

- [ ] POST con credenciales válidas de administrador crea sesión y redirige a `/dashboard`
- [ ] POST con credenciales válidas de usuario normal crea sesión y redirige a `/cliente/[clienteId]/dashboard`
- [ ] POST con credenciales incorrectas retorna error 401 sin crear sesión
- [ ] POST con usuario inactivo retorna error 403 sin crear sesión
- [ ] La sesión creada contiene todos los campos necesarios (id, username, nombre, rol, clienteId)
- [ ] La sesión persiste después de recargar la página
