# porcion-005 — Validación de tipo de operación — lógica [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-003
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear el endpoint que devuelve los tipos de operación disponibles para el cliente autenticado, y validar en el backend que el tipo de operación enviado en una operación nueva sea uno de los cuatro tipos válidos.

## Ejemplo de uso

El frontend solicita los tipos de operación mediante `GET /api/operation-types`, el backend responde con los cuatro tipos disponibles para ese cliente. Cuando el frontend envía una operación nueva, el backend valida que el `tipoOperacionId` corresponda a uno de los cuatro tipos válidos antes de guardar.

## Criterios de aceptación

- [ ] El endpoint `GET /api/operation-types` devuelve los tipos de operación del cliente autenticado
- [ ] El endpoint devuelve únicamente los cuatro tipos específicos: "Venta desde stock", "Venta con toma de usado", "Venta 0km", "A conseguir"
- [ ] El endpoint responde con código 200 y un JSON con formato `{ operationTypes: [...] }`
- [ ] El endpoint requiere autenticación y devuelve 401 si no hay sesión válida
- [ ] La validación del tipo de operación en el endpoint de creación de operaciones verifica que el ID enviado corresponda a uno de los cuatro tipos válidos
- [ ] Si el tipo de operación no es válido, el backend responde con código 400 y mensaje "Tipo de operación inválido"

## Pruebas

### Pruebas unitarias

- [ ] El servicio que obtiene los tipos de operación filtra correctamente por clienteId
- [ ] El servicio devuelve únicamente los cuatro tipos específicos
- [ ] La función de validación de tipo de operación retorna `true` para IDs válidos
- [ ] La función de validación de tipo de operación retorna `false` para IDs inválidos o inexistentes

### Pruebas de integración

- [ ] `GET /api/operation-types` sin autenticación devuelve 401
- [ ] `GET /api/operation-types` con autenticación válida devuelve 200 y los tipos del cliente
- [ ] Al crear una operación con un `tipoOperacionId` válido, la operación se guarda correctamente
- [ ] Al crear una operación con un `tipoOperacionId` inválido, el backend devuelve 400 con mensaje de error
- [ ] Al crear una operación con un `tipoOperacionId` de otro cliente, el backend devuelve 400 o 403
