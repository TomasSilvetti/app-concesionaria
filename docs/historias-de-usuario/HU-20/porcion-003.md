# porcion-003 — API CRUD de columnas [BACK]

**Historia de usuario:** HU-20: Tablero Kanban para seguimiento de pendientes
**Par:** porcion-002
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-04-07
**Prerequisitos:** porcion-001

## Descripción

Implementar los endpoints necesarios para gestionar las columnas del tablero: obtener todas las columnas de un cliente, crear una columna nueva, renombrar una columna existente y eliminar una columna (con lógica de advertencia si tiene tarjetas).

## Ejemplo de uso

El frontend llama a `GET /api/kanban/columnas` y recibe el listado ordenado de columnas del cliente. Al crear una columna llama a `POST /api/kanban/columnas` con `{ nombre: "Lista de espera" }`. Al eliminar llama a `DELETE /api/kanban/columnas/:id` y si la columna tiene tarjetas el endpoint devuelve la cantidad para que el frontend muestre la advertencia.

## Criterios de aceptación

- [ ] `GET /api/kanban/columnas` devuelve las columnas del cliente autenticado, ordenadas por `orden` ascendente, incluyendo sus tarjetas
- [ ] `POST /api/kanban/columnas` crea una columna con el nombre recibido y la asigna al `orden` más alto + 1
- [ ] `PATCH /api/kanban/columnas/:id` permite renombrar una columna
- [ ] `DELETE /api/kanban/columnas/:id` elimina la columna y todas sus tarjetas en cascada
- [ ] Todos los endpoints validan que la columna pertenece al cliente autenticado antes de operar
- [ ] Los errores (columna no encontrada, nombre vacío, sin permisos) devuelven códigos HTTP apropiados con mensaje descriptivo

## Pruebas

### Pruebas unitarias

- [ ] El servicio de creación asigna correctamente el valor de `orden` como el máximo actual + 1
- [ ] El servicio de renombrado rechaza un nombre vacío o con solo espacios
- [ ] El servicio de eliminación no puede borrar una columna que pertenece a otro cliente

### Pruebas de integración

- [ ] `GET /api/kanban/columnas` devuelve solo las columnas del cliente del token, no las de otros clientes
- [ ] `POST /api/kanban/columnas` persiste la columna y la devuelve con id y orden asignados
- [ ] `DELETE /api/kanban/columnas/:id` elimina la columna y sus tarjetas asociadas; confirmar que las tarjetas ya no existen en BD
- [ ] Llamar `PATCH` con id de columna de otro cliente devuelve 403
