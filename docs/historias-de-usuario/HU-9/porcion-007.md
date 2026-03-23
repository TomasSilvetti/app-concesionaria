# porcion-007 — Vista previa/editor de documento con campos autocompletados [FRONT]

**Historia de usuario:** HU-9: Módulo de Documentos — Generación y Gestión de Documentos por Operación
**Par:** porcion-008
**Tipo:** FRONT
**Prerequisitos:** porcion-006

## Descripción

Implementar la pantalla de revisión y edición del documento a generar. Se muestra la vista previa del documento con los placeholders reemplazados: los campos mapeados aparecen autocompletados con los datos reales de la operación; los campos sin mapeo aparecen como inputs editables directamente sobre la vista previa (inline), para que el empleado pueda completarlos antes de confirmar. Al confirmar, se envía el documento con todos los valores al backend para su guardado.

## Ejemplo de uso

El vendedor seleccionó "Contrato de compraventa". Ve el documento renderizado: los campos nombre del comprador, marca, modelo y precio ya están completados con los datos de la operación (resaltados en verde). El campo "número de cuotas" aparece en blanco como un input editable dentro del documento. El vendedor escribe "12", revisa el resultado y hace clic en "Generar". El documento se guarda y aparece en la sección de documentos de la operación.

## Criterios de aceptación

- [ ] La vista muestra la plantilla renderizada con los placeholders mapeados reemplazados por los valores reales de la operación
- [ ] Los valores autocompletados se distinguen visualmente de los campos en blanco (ej: color de fondo diferente)
- [ ] Los placeholders sin mapeo (o mapeados pero sin valor en la operación) se muestran como inputs de texto editables superpuestos sobre la posición del placeholder en el documento
- [ ] Los inputs inline permiten escribir el valor que falta directamente sobre la vista previa
- [ ] El botón "Generar" está siempre habilitado; los campos en blanco se guardan vacíos si el usuario no los completa
- [ ] Hay un botón "Cancelar" o "Volver" que descarta los cambios y regresa al modal de selección
- [ ] Se muestra un indicador de carga mientras se obtiene la plantilla y los datos de la operación
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Los placeholders con valor mapeado se renderizan como texto estático con el valor de la operación
- [ ] Los placeholders sin valor (sin mapeo o datos faltantes) se renderizan como inputs editables
- [ ] Al escribir en un input inline, el estado del componente se actualiza con el nuevo valor
- [ ] El botón "Generar" invoca el callback de confirmación con el payload completo (valores mapeados + valores ingresados manualmente)
- [ ] Si todos los campos están completos, no se muestra ningún indicador de campos faltantes

### Pruebas de integración

- [ ] Al montar el componente, se llama al servicio con el `plantillaId` y el `operacionId` para obtener la plantilla y los datos de la operación
- [ ] Los datos de la operación (nombre comprador, marca, modelo, precio, etc.) se inyectan correctamente en los placeholders mapeados
- [ ] Al hacer clic en "Generar", se llama al servicio de generación (`POST /api/documentos/generados`) con el payload correcto y todos los valores finales
