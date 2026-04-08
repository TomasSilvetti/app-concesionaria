# porcion-007 — API CRUD de tarjetas [BACK]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-006
**Tipo:** BACK
**Estado:** completada
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints para crear, editar y eliminar tarjetas del tablero. Al crear, se asocia automáticamente el usuario autenticado como creador (id y nombre). Al eliminar, se reordena el resto de tarjetas de la columna para mantener el orden sin huecos.

## Ejemplo de uso

El frontend llama a `POST /api/kanban/tarjetas` con `{ columnaId, titulo, cuerpo }` y el backend crea la tarjeta con `creadoPorId` e `creadoPorNombre` tomados del token de sesión, y le asigna el `orden` más alto de la columna + 1. Devuelve la tarjeta creada completa.

## Criterios de aceptación

- [ ] `POST /api/kanban/tarjetas` crea una tarjeta asignando automáticamente el usuario autenticado como creador y el `orden` al final de la columna
- [ ] `PATCH /api/kanban/tarjetas/:id` permite editar `titulo` y `cuerpo`; no permite cambiar el creador ni la columna (eso es responsabilidad del endpoint de mover)
- [ ] `DELETE /api/kanban/tarjetas/:id` elimina la tarjeta y reordena las tarjetas restantes de esa columna
- [ ] Todos los endpoints validan que la tarjeta pertenezca al cliente autenticado
- [ ] `POST` rechaza un título vacío o solo espacios con 400
- [ ] El campo `creadoPorNombre` se guarda como texto plano (no se recalcula si el usuario cambia de nombre)

## Pruebas

### Pruebas unitarias

- [ ] El servicio de creación asigna `creadoPorId` y `creadoPorNombre` del usuario autenticado, ignorando cualquier valor que venga en el body
- [ ] El servicio de creación rechaza un `titulo` vacío
- [ ] El servicio de edición no permite modificar `creadoPorId`, `creadoPorNombre` ni `columnaId`

### Pruebas de integración

- [ ] `POST /api/kanban/tarjetas` persiste la tarjeta con los datos correctos y devuelve 201 con el objeto creado
- [ ] `DELETE /api/kanban/tarjetas/:id` elimina la tarjeta; confirmar en BD que ya no existe
- [ ] Intentar editar una tarjeta de otro cliente devuelve 403 y no modifica ningún dato
- [ ] Crear una tarjeta en una columna inexistente devuelve 404
