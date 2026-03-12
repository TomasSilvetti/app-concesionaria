# porcion-014 — Funcionalidad de logout — botón y lógica [FRONT+BACK]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** —
**Tipo:** FRONT+BACK
**Prerequisitos:** porcion-002
**Estado:** ✅ Completada
**Completada el:** 2026-03-12

## Descripción

Implementar el botón de cerrar sesión en el menú del avatar y la lógica que destruye la sesión del usuario, lo redirige al login, y muestra mensaje de confirmación. Es una porción simple que combina vista y lógica porque no justifica separación.

## Ejemplo de uso

El usuario hace clic en su avatar en la esquina superior derecha, selecciona "Cerrar sesión", el sistema destruye su sesión JWT, lo redirige a la pantalla de login, y muestra el mensaje "Sesión cerrada exitosamente".

## Criterios de aceptación

- [ ] Existe un botón "Cerrar sesión" en el menú del avatar de la navbar
- [ ] Al hacer clic, el sistema llama a NextAuth signOut
- [ ] La sesión JWT se destruye completamente
- [ ] El usuario es redirigido automáticamente a `/login`
- [ ] Se muestra el mensaje "Sesión cerrada exitosamente" en la pantalla de login
- [ ] Después del logout, el usuario no puede acceder a rutas protegidas sin volver a autenticarse
- [ ] El botón es accesible desde cualquier pantalla del sistema

## Pruebas

### Pruebas unitarias

- [ ] El botón "Cerrar sesión" se renderiza en el menú del avatar
- [ ] Al hacer clic en el botón, se llama a la función signOut de NextAuth
- [ ] La función signOut recibe el parámetro de redirect a `/login`
- [ ] El mensaje de éxito se muestra después de la redirección

### Pruebas de integración

- [ ] Al hacer clic en "Cerrar sesión", el usuario es redirigido a `/login`
- [ ] Después del logout, GET a `/api/auth/session` retorna null
- [ ] Después del logout, intentar acceder a `/dashboard` redirige a `/login`
- [ ] El mensaje "Sesión cerrada exitosamente" aparece en la pantalla de login después del logout
- [ ] El botón funciona correctamente desde cualquier ruta del sistema
