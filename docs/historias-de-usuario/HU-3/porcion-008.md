# porcion-008 — Listado de usuarios — vista [FRONT]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-009
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la pantalla de listado de usuarios que muestra una tabla con username, nombre completo, rol, cliente asociado (si aplica), y estado activo/inactivo. Incluye botón para crear nuevo usuario y filtros básicos por rol y estado.

## Ejemplo de uso

El administrador accede a la sección "Usuarios" y ve una tabla con todos los usuarios del sistema. Puede filtrar por rol (admin/usuario) o por estado (activo/inactivo). Cada fila muestra el nombre de usuario, nombre completo, rol, cliente (si no es admin), y un indicador visual de si está activo.

## Criterios de aceptación

- [ ] La tabla muestra columnas: username, nombre completo, rol, cliente, estado (activo/inactivo)
- [ ] La columna "cliente" muestra el nombre del cliente o "—" si es administrador
- [ ] El estado activo/inactivo se muestra con un indicador visual claro (badge, color, ícono)
- [ ] Existe un botón "Crear nuevo usuario" que abre el formulario de creación
- [ ] Existe un filtro por rol con opciones: Todos, Admin, Usuario
- [ ] Existe un filtro por estado con opciones: Todos, Activos, Inactivos
- [ ] La tabla muestra un estado de carga mientras se obtienen los datos
- [ ] La tabla muestra mensaje "No hay usuarios" cuando el resultado está vacío
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] La tabla renderiza correctamente cuando recibe un array de usuarios
- [ ] La tabla muestra "—" en la columna cliente cuando clienteId es null
- [ ] El badge de estado muestra "Activo" cuando activo=true
- [ ] El badge de estado muestra "Inactivo" cuando activo=false
- [ ] El filtro por rol filtra correctamente los usuarios mostrados
- [ ] El filtro por estado filtra correctamente los usuarios mostrados
- [ ] El estado de carga se muestra cuando isLoading es true
- [ ] El mensaje "No hay usuarios" se muestra cuando el array está vacío

### Pruebas de integración

- [ ] Al montar el componente, se dispara la llamada al endpoint de listado de usuarios
- [ ] Al cambiar el filtro de rol, se actualiza la tabla con los usuarios filtrados
- [ ] Al cambiar el filtro de estado, se actualiza la tabla con los usuarios filtrados
- [ ] Al hacer clic en "Crear nuevo usuario", se abre el formulario de creación (porcion-006)
- [ ] Después de crear un usuario exitosamente, la tabla se recarga y muestra el nuevo usuario
