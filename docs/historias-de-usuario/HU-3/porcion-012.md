# porcion-012 — Pantalla de perfil de usuario — vista [FRONT]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-013
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la pantalla de perfil donde el usuario puede ver su información básica de solo lectura: nombre de usuario, nombre completo, rol, cliente asociado (si aplica) y estado de cuenta. Accesible desde el menú del avatar en la barra de navegación.

## Ejemplo de uso

El usuario hace clic en su avatar en la esquina superior derecha y selecciona "Mi perfil". Se abre una pantalla mostrando sus datos: "Nombre de usuario: jperez", "Nombre: Juan Pérez", "Rol: Usuario", "Cliente: Concesionaria Norte", "Estado: Activo". Todos los campos son de solo lectura.

## Criterios de aceptación

- [ ] La pantalla muestra el nombre de usuario del usuario autenticado
- [ ] La pantalla muestra el nombre completo del usuario
- [ ] La pantalla muestra el rol (Admin o Usuario)
- [ ] La pantalla muestra el nombre del cliente asociado (o "—" si es administrador)
- [ ] La pantalla muestra el estado de la cuenta (Activo/Inactivo)
- [ ] Todos los campos son de solo lectura (no editables)
- [ ] La pantalla es accesible desde el menú del avatar en la navbar
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza todos los campos con los datos del usuario
- [ ] El campo cliente muestra "—" cuando clienteId es null
- [ ] El campo cliente muestra el nombre del cliente cuando existe la relación
- [ ] El badge de rol muestra "Admin" cuando rol="admin"
- [ ] El badge de rol muestra "Usuario" cuando rol="usuario"
- [ ] El badge de estado muestra "Activo" cuando activo=true
- [ ] El badge de estado muestra "Inactivo" cuando activo=false

### Pruebas de integración

- [ ] Al montar el componente, se dispara la llamada al endpoint de perfil
- [ ] El componente muestra un estado de carga mientras se obtienen los datos
- [ ] Si el endpoint retorna error 401, el usuario es redirigido al login
- [ ] Los datos se muestran correctamente después de recibir la respuesta del endpoint
