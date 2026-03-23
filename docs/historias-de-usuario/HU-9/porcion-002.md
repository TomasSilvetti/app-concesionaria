# porcion-002 — Página Documentos — layout y lista de plantillas [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** Ninguno

## Descripción

Crear la nueva página "Documentos" accesible desde el sidebar, con su entrada de navegación y la vista de lista de plantillas configuradas. La página muestra las plantillas existentes con nombre, tipo de archivo y acciones (editar, borrar). Incluye el estado vacío cuando no hay plantillas y el botón "Subir documento" para iniciar el flujo de carga. En esta porción los datos son mockeados; la conexión real se hace en porcion-003.

## Ejemplo de uso

El empleado hace clic en "Documentos" en el sidebar, llega a una página con el título "Documentos" y ve una lista de plantillas guardadas (ej: "Contrato de compraventa — PDF", "Formulario de transferencia — DOCX"). Si no hay ninguna, ve el mensaje "No hay plantillas cargadas aún" y el botón "Subir documento".

## Criterios de aceptación

- [ ] Existe una nueva entrada "Documentos" en el sidebar que navega a la ruta `/documentos`
- [ ] La página muestra un listado de plantillas con: nombre, tipo de archivo (PDF/DOCX) y acciones (editar, borrar)
- [ ] Cuando no hay plantillas, se muestra un estado vacío con mensaje informativo y botón "Subir documento"
- [ ] El botón "Subir documento" está visible también cuando hay plantillas en la lista
- [ ] El botón "Borrar" de una plantilla abre un diálogo de confirmación antes de proceder
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Cuando la lista de plantillas está vacía, se renderiza el estado vacío con el mensaje correcto
- [ ] Cuando hay plantillas, se renderiza una fila por cada plantilla con nombre, tipo y botones de acción
- [ ] El botón "Borrar" dispara la apertura del diálogo de confirmación y no ejecuta la acción directamente
- [ ] El badge de tipo de archivo muestra "PDF" o "DOCX" según el `mimeType` de la plantilla

### Pruebas de integración

- [ ] Al hacer clic en "Documentos" en el sidebar, se navega correctamente a `/documentos`
- [ ] Al confirmar el borrado en el diálogo, se llama a la función de eliminación con el id correcto
