# porcion-003 — Pantalla de login — vista [FRONT]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-004
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la pantalla de login con campos de nombre de usuario y contraseña, botón de ingreso, y mensajes de error visibles cuando las credenciales son incorrectas o la cuenta está inactiva.

## Ejemplo de uso

El usuario accede a la aplicación y ve un formulario centrado con dos campos: "Nombre de usuario" y "Contraseña". Al ingresar credenciales incorrectas y hacer clic en "Iniciar sesión", aparece el mensaje "Nombre de usuario o contraseña incorrectos" debajo del formulario.

## Criterios de aceptación

- [ ] La pantalla muestra un formulario con campos username y password
- [ ] El campo password oculta el texto por defecto con opción de mostrarlo (ícono de ojo)
- [ ] El botón "Iniciar sesión" está deshabilitado si algún campo está vacío
- [ ] Se muestra mensaje de error cuando las credenciales son incorrectas
- [ ] Se muestra mensaje específico cuando la cuenta está inactiva: "Tu cuenta está inactiva. Contactá al administrador"
- [ ] El formulario muestra un estado de carga (spinner o texto) mientras se validan las credenciales
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón "Iniciar sesión" se deshabilita cuando username está vacío
- [ ] El botón "Iniciar sesión" se deshabilita cuando password está vacío
- [ ] El toggle de visibilidad de contraseña cambia el tipo del input entre "password" y "text"
- [ ] El mensaje de error se muestra cuando el componente recibe estado de error
- [ ] El mensaje de cuenta inactiva se muestra cuando el componente recibe ese estado específico
- [ ] El spinner de carga se muestra cuando isLoading es true

### Pruebas de integración

- [ ] Al hacer clic en "Iniciar sesión" con campos completos, se dispara la llamada a NextAuth signIn
- [ ] Si signIn retorna error 401, el componente muestra "Nombre de usuario o contraseña incorrectos"
- [ ] Si signIn retorna error 403, el componente muestra "Tu cuenta está inactiva. Contactá al administrador"
- [ ] El componente limpia el mensaje de error cuando el usuario empieza a escribir nuevamente
