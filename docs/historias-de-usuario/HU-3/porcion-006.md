# porcion-006 — Formulario de creación de usuario — vista [FRONT]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-007
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-12

## Descripción

Crear el formulario visual para que administradores puedan crear nuevos usuarios. Incluye campos de nombre de usuario, nombre completo, contraseña, rol (admin/usuario) y selector de cliente que aparece solo cuando el rol es "usuario".

## Ejemplo de uso

El administrador hace clic en "Crear nuevo usuario" y ve un formulario modal o en una página separada. Completa los campos, selecciona rol "usuario", y automáticamente aparece un dropdown para elegir el cliente. Al seleccionar rol "admin", el dropdown de cliente desaparece.

## Criterios de aceptación

- [ ] El formulario muestra campos: username, nombre completo, contraseña, rol
- [ ] El campo rol es un selector con opciones "admin" y "usuario"
- [ ] El dropdown de cliente aparece solo cuando rol="usuario"
- [ ] El dropdown de cliente se oculta cuando rol="admin"
- [ ] El campo contraseña tiene toggle de visibilidad (ícono de ojo)
- [ ] El botón "Guardar" está deshabilitado si faltan campos obligatorios
- [ ] Se muestra mensaje de error cuando el username ya existe
- [ ] Se muestra mensaje de confirmación cuando el usuario se crea exitosamente
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El dropdown de cliente se renderiza cuando rol="usuario"
- [ ] El dropdown de cliente no se renderiza cuando rol="admin"
- [ ] El botón "Guardar" se deshabilita cuando username está vacío
- [ ] El botón "Guardar" se deshabilita cuando password está vacío
- [ ] El botón "Guardar" se deshabilita cuando rol="usuario" y no se seleccionó cliente
- [ ] El toggle de visibilidad de contraseña cambia el tipo del input
- [ ] El mensaje de error se muestra cuando el componente recibe estado de username duplicado

### Pruebas de integración

- [ ] Al cambiar el selector de rol de "usuario" a "admin", el dropdown de cliente desaparece y se limpia su valor
- [ ] Al hacer clic en "Guardar" con datos válidos, se dispara la llamada al endpoint de creación
- [ ] Si el endpoint retorna error 409 (username duplicado), se muestra el mensaje de error correspondiente
- [ ] Si el endpoint retorna éxito 201, se muestra mensaje de confirmación y el formulario se limpia
