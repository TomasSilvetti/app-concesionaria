# porcion-010 — Activar/desactivar usuario — vista (toggle en listado) [FRONT]

**Historia de usuario:** HU-3: Sistema de Autenticación y Gestión de Usuarios
**Par:** porcion-011
**Tipo:** FRONT
**Prerequisitos:** porcion-008
**Estado:** ✅ Completada
**Completada el:** 2026-03-12

## Descripción

Agregar un toggle o botón en cada fila del listado de usuarios que permite al administrador activar o desactivar usuarios. Incluye modal de confirmación antes de desactivar, y actualización visual inmediata del estado en la tabla.

## Ejemplo de uso

El administrador ve la lista de usuarios y hace clic en el toggle "Activo" de un usuario. Aparece un modal preguntando "¿Estás seguro de desactivar este usuario?". Al confirmar, el toggle cambia a "Inactivo" y el badge de estado se actualiza visualmente en la tabla.

## Criterios de aceptación

- [ ] Cada fila de la tabla tiene un toggle o switch para activar/desactivar
- [ ] El toggle refleja el estado actual del usuario (activo/inactivo)
- [ ] Al intentar desactivar un usuario, aparece un modal de confirmación
- [ ] El modal muestra el mensaje: "¿Estás seguro de desactivar este usuario?"
- [ ] Al confirmar, el toggle cambia de estado inmediatamente
- [ ] Al cancelar, el toggle vuelve a su estado original
- [ ] El badge de estado en la tabla se actualiza automáticamente después del cambio
- [ ] Se muestra un mensaje de éxito: "Usuario desactivado exitosamente" o "Usuario activado exitosamente"
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El toggle se renderiza en estado "activo" cuando el usuario tiene activo=true
- [ ] El toggle se renderiza en estado "inactivo" cuando el usuario tiene activo=false
- [ ] Al hacer clic en el toggle para desactivar, se abre el modal de confirmación
- [ ] Al hacer clic en el toggle para activar, NO se abre modal (acción directa)
- [ ] Al confirmar en el modal, se dispara la acción de cambio de estado
- [ ] Al cancelar en el modal, el toggle vuelve a su estado original
- [ ] El mensaje de éxito muestra el texto correcto según la acción (activar/desactivar)

### Pruebas de integración

- [ ] Al confirmar desactivación, se llama al endpoint PATCH con activo=false
- [ ] Al activar un usuario, se llama al endpoint PATCH con activo=true
- [ ] Después de cambio exitoso, la tabla se actualiza sin recargar toda la página
- [ ] Si el endpoint retorna error, el toggle vuelve a su estado original y se muestra mensaje de error
- [ ] El badge de estado cambia de color/texto inmediatamente después del cambio exitoso
