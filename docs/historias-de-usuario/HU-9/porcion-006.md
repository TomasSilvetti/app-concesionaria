# porcion-006 — UI asignación de plantillas a empresas [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-007
**Tipo:** FRONT
**Prerequisitos:** porcion-002
**Estado:** completada

## Descripción

Crear el panel de asignación de una plantilla a empresas, accesible desde el listado de plantillas. Muestra la lista de todas las empresas (clientes) con un toggle activo/inactivo por cada una, permitiendo al admin habilitar o deshabilitar la plantilla para cada empresa de forma individual.

## Ejemplo de uso

El admin hace clic en "Asignar empresas" en la fila de "Contrato de compraventa". Se abre un panel con la lista de empresas: "Concesionaria Norte" (activo ✓), "Concesionaria Sur" (inactivo), "Grupo AutoMax" (activo ✓). El admin activa "Concesionaria Sur" con un toggle y guarda.

## Criterios de aceptación

- [ ] Desde el listado de plantillas, el botón "Asignar empresas" abre un panel o modal con la lista de todos los clientes (empresas)
- [ ] Cada empresa tiene un toggle que refleja si la plantilla está activa para ella
- [ ] El estado inicial de cada toggle se carga desde el servicio (asignaciones existentes)
- [ ] El admin puede activar o desactivar cualquier empresa; los cambios se aplican al hacer clic en "Guardar"
- [ ] Mientras los datos de asignaciones se cargan, se muestran los toggles en estado de carga
- [ ] Al guardar, se muestra feedback de éxito o error
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El toggle de una empresa muestra el estado `activo` cuando la asignación existe y tiene `activo: true`
- [ ] El toggle muestra inactivo cuando la asignación no existe o tiene `activo: false`
- [ ] El botón "Guardar" está deshabilitado si no hubo cambios respecto al estado inicial
- [ ] El estado de carga se muestra cuando `isLoadingAssignments` es `true`

### Pruebas de integración

- [ ] Al abrir el panel, se llama al servicio para obtener la lista de empresas y las asignaciones existentes para esa plantilla
- [ ] Al hacer clic en "Guardar", se envía al servicio solo los cambios realizados (no todas las asignaciones)
- [ ] Si el servicio de guardado responde con éxito, se muestra feedback y el panel actualiza los valores
- [ ] Si el servicio de guardado falla, se muestra un error y los toggles no cambian de estado
