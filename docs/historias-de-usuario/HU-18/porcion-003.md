# porcion-003 — API de inversores (búsqueda/creación) y guardado de inversión en operación [BACK]

**Historia de usuario:** HU-18: Inversores en operaciones
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-27

## Descripción

Implementar los endpoints necesarios para: buscar inversores existentes por nombre, crear un inversor nuevo si no existe, y guardar o actualizar la inversión (con todos sus participantes) al guardar una operación. La concesionaria se identifica en la inversión por el flag `esConcecionaria`, sin requerir un registro de `Inversor`.

## Ejemplo de uso

El frontend llama a `GET /api/inversores?q=Juan` y recibe la lista de inversores que coinciden. Si el usuario elige crear uno nuevo, llama a `POST /api/inversores` con el nombre. Al guardar la operación, el payload incluye los datos de inversión y el backend persiste o actualiza el registro de `Inversion` y sus `InversionParticipante`.

## Criterios de aceptación

- [ ] `GET /api/[clienteId]/inversores?q={texto}` devuelve inversores cuyo nombre contiene el texto buscado (insensible a mayúsculas), filtrados por `clienteId`
- [ ] `POST /api/[clienteId]/inversores` crea un nuevo inversor con el nombre recibido y devuelve el registro creado
- [ ] Al guardar una operación con datos de inversión, el backend crea o actualiza el registro `Inversion` y reemplaza todos sus `InversionParticipante` con los recibidos
- [ ] El campo `porcentajeParticipacion` se recalcula y persiste en el backend al guardar (no se confía solo en el valor del frontend)
- [ ] Si la inversión ya existía y se desactiva el toggle, el registro `Inversion` y sus participantes se eliminan
- [ ] No se puede guardar una inversión con montos totales en $0 si hay más de un participante (se devuelve error 400)
- [ ] Los endpoints validan que el `clienteId` del inversor coincida con el de la operación

## Pruebas

### Pruebas unitarias

- [ ] La función de cálculo de `porcentajeParticipacion` devuelve los valores correctos para N participantes con distintos montos
- [ ] La función de cálculo retorna 0 para todos cuando el total de montos es $0
- [ ] El servicio de guardado de inversión elimina los participantes anteriores antes de insertar los nuevos (upsert por reemplazo)
- [ ] Se lanza un error controlado si se intenta crear un inversor con nombre vacío

### Pruebas de integración

- [ ] `GET /api/[clienteId]/inversores?q=jua` devuelve inversores con "jua" en el nombre (case-insensitive) y no incluye los de otro cliente
- [ ] `POST /api/[clienteId]/inversores` con nombre "Carlos López" crea el registro y lo devuelve con su `id`
- [ ] Guardar una operación con 2 participantes persiste correctamente `Inversion` e `InversionParticipante` con los porcentajes recalculados
- [ ] Guardar la misma operación nuevamente con 3 participantes reemplaza los participantes anteriores sin duplicar registros
