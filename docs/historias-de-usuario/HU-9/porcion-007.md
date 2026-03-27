# porcion-007 — API asignación de plantillas a empresas [BACK]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-006
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Crear los endpoints para leer y actualizar las asignaciones de una plantilla a empresas (clientes). Permite al panel de porcion-006 cargar el estado actual de las asignaciones y aplicar cambios de activación/desactivación.

## Ejemplo de uso

El panel de asignación llama a `GET /api/admin/document-templates/[id]/assignments` y recibe qué empresas tienen la plantilla activa. Luego el admin guarda cambios con `PUT /api/admin/document-templates/[id]/assignments` enviando el array con los nuevos estados y el servidor actualiza (o crea) los registros `DocumentAssignment` correspondientes.

## Criterios de aceptación

- [ ] `GET /api/admin/document-templates/[id]/assignments` devuelve la lista de todos los clientes, cada uno con el campo `activo` que indica si tienen la plantilla asignada y activa
- [ ] `PUT /api/admin/document-templates/[id]/assignments` recibe un array de `{ clienteId, activo }` y hace upsert en `DocumentAssignment` para cada entrada
- [ ] Solo los registros incluidos en el body se modifican; los no incluidos permanecen sin cambios
- [ ] Solo accesible para usuarios con rol `admin`; devuelve 403 si no
- [ ] Si el `templateId` no existe, devuelve 404
- [ ] El upsert se realiza en una única transacción; si falla parcialmente, no se aplica ningún cambio

## Pruebas

### Pruebas unitarias

- [ ] El servicio de upsert crea un `DocumentAssignment` nuevo cuando no existe para esa combinación `(templateId, clienteId)`
- [ ] El servicio de upsert actualiza `activo` cuando ya existe el registro
- [ ] El servicio devuelve la lista completa de clientes con el campo `activo` correctamente resuelto (incluyendo los que no tienen asignación, que se devuelven con `activo: false`)

### Pruebas de integración

- [ ] `GET /api/admin/document-templates/[id]/assignments` devuelve todos los clientes con su estado correcto
- [ ] `PUT /api/admin/document-templates/[id]/assignments` con `[{ clienteId: "A", activo: true }]` crea la asignación si no existía
- [ ] `PUT /api/admin/document-templates/[id]/assignments` con `[{ clienteId: "A", activo: false }]` desactiva la asignación existente
- [ ] Tras el PUT, `GET` devuelve los estados actualizados
- [ ] `PUT` con `templateId` inexistente devuelve 404
