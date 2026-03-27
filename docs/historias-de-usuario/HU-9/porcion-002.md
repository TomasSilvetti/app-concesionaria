# porcion-002 — Página `/admin/documentos` — listado de plantillas [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Backoffice de Plantillas y Generación Contextual
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completado

## Descripción

Crear la página del backoffice admin en `/admin/documentos` que muestra la lista de plantillas existentes con sus datos básicos (nombre, contexto, empresas asignadas) y las acciones disponibles: crear nueva plantilla, editar, asignar empresas y eliminar.

## Ejemplo de uso

El admin navega a `/admin/documentos` y ve una tabla con las plantillas "Contrato de compraventa" (contexto: operacion, asignada a 3 empresas) y "Ficha de vehículo" (contexto: vehiculo, asignada a 1 empresa). Hay un botón "Nueva plantilla" en la parte superior y botones de acción en cada fila.

## Criterios de aceptación

- [ ] La ruta `/admin/documentos` existe y renderiza la página de gestión de plantillas
- [ ] La página muestra una tabla/listado con: nombre de la plantilla, contexto (`Operación` o `Vehículo`), cantidad de empresas asignadas, y acciones (editar, asignar empresas, eliminar)
- [ ] Hay un botón "Nueva plantilla" visible en la parte superior que inicia el flujo de creación
- [ ] Al hacer clic en "Eliminar", se muestra un diálogo de confirmación antes de proceder
- [ ] Mientras los datos se están cargando, se muestra un estado de carga (skeleton o spinner)
- [ ] Si no hay plantillas, se muestra un estado vacío con el mensaje "No hay plantillas creadas aún" y el botón "Nueva plantilla"
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El listado renderiza correctamente cada plantilla con nombre, contexto y cantidad de empresas
- [ ] El estado vacío se muestra cuando la lista de plantillas está vacía
- [ ] El estado de carga se muestra mientras `isLoading` es `true`
- [ ] El diálogo de confirmación de eliminación se muestra al hacer clic en "Eliminar" y desaparece al cancelar

### Pruebas de integración

- [ ] Al entrar a la página, se realiza la llamada al servicio para obtener las plantillas y se renderizan los resultados
- [ ] Al confirmar la eliminación de una plantilla, se llama al servicio de eliminación y la plantilla desaparece del listado
- [ ] Si la llamada al servicio falla, se muestra un mensaje de error al usuario
