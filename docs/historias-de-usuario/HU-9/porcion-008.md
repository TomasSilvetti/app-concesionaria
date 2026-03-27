# porcion-008 — Botón "Generar documento" y modal de selección de plantilla [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-009
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear el componente reutilizable `GenerarDocumentoButton` que, dado un contexto (`operacion` o `vehiculo`) y el id de la entidad, consulta si hay plantillas disponibles, muestra el botón "Generar documento" condicionalmente, y al pulsarlo abre un modal con el listado de plantillas disponibles para seleccionar.

## Ejemplo de uso

El componente se coloca en el detalle de una operación pasándole `contextType="operacion"` y `contextId="op-123"`. Si la empresa del empleado tiene plantillas activas para ese contexto, aparece el botón "Generar documento" junto al botón "Editar". Al pulsarlo, un modal muestra las opciones "Contrato de compraventa" y "Recibo de señal". Si no hay plantillas, muestra "No hay documentos disponibles para este módulo."

## Criterios de aceptación

- [ ] El componente acepta las props `contextType` (`operacion` | `vehiculo`) y `contextId`
- [ ] El botón "Generar documento" solo se muestra si hay al menos una plantilla activa disponible para el contexto y empresa del usuario
- [ ] Si no hay plantillas disponibles, el botón no se renderiza (no se muestra ni oculto)
- [ ] Al hacer clic en el botón, se abre un modal con la lista de plantillas disponibles para ese contexto
- [ ] Cada plantilla en el modal se muestra con su nombre y un botón para seleccionarla
- [ ] Si el modal se carga sin plantillas (caso edge: desaparecieron entre la carga inicial y la apertura), se muestra el mensaje "No hay documentos disponibles para este módulo."
- [ ] Al seleccionar una plantilla, el modal emite el evento/callback con el `templateId` seleccionado para que el componente padre continúe el flujo de generación
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón no se renderiza cuando la lista de plantillas disponibles está vacía
- [ ] El botón se renderiza cuando hay al menos una plantilla en la lista
- [ ] El modal se abre al hacer clic en el botón y se cierra al hacer clic en cancelar o fuera del modal
- [ ] El mensaje "No hay documentos disponibles para este módulo." se muestra en el modal cuando la lista está vacía

### Pruebas de integración

- [ ] Al montar el componente, se llama al servicio con `contextType` y `contextId` para obtener las plantillas disponibles
- [ ] Si el servicio devuelve plantillas, el botón se muestra; si devuelve lista vacía, el botón no aparece
- [ ] Al seleccionar una plantilla en el modal, se dispara el callback con el `templateId` correcto
- [ ] Si el servicio falla al cargar plantillas, el botón no se muestra (fallo silencioso en favor de no romper la página)
