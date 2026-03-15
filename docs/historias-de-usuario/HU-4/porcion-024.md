# porcion-024 — Formulario de creación de vehículo — vista [FRONT]

**Historia de usuario:** HU-4: Gestión de Stock de Vehículos
**Par:** porcion-025
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**estado:** ✅ Completada

## Descripción

Crear el formulario de creación de vehículo con todos los campos necesarios: versión, color, kilómetros, tipo de ingreso, notas mecánicas, notas generales, precio revista, precio oferta y carga de fotos. El formulario debe validar campos obligatorios antes de permitir el envío.

## Ejemplo de uso

El usuario hace clic en "Agregar vehículo" y se abre un formulario con todos los campos. Completa versión "1.8 XEi", color "Rojo", kilómetros "50000", selecciona tipo de ingreso "Compra", ingresa precio revista "15000" y hace clic en "Guardar". Si falta algún campo obligatorio, se muestran mensajes de error debajo de cada campo.

## Criterios de aceptación

- [ ] El formulario se muestra en una ruta `/stock/nuevo` o en un modal
- [ ] Incluye campos para: versión (text), color (text), kilómetros (number), tipo de ingreso (select), notas mecánicas (textarea), notas generales (textarea), precio revista (number), precio oferta (number), fotos (file upload)
- [ ] Los campos obligatorios están marcados visualmente con asterisco
- [ ] El botón "Guardar" está deshabilitado si faltan campos obligatorios
- [ ] Si se intenta guardar con campos inválidos, se muestran mensajes de error específicos debajo de cada campo
- [ ] Hay un botón "Cancelar" que cierra el formulario sin guardar
- [ ] Mientras se envía el formulario, se muestra un indicador de carga y los botones se deshabilitan
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El botón "Guardar" se deshabilita cuando faltan campos obligatorios
- [ ] Los mensajes de error se muestran cuando se intenta enviar con campos vacíos
- [ ] El campo de kilómetros solo acepta valores numéricos positivos
- [ ] Los campos de precio solo aceptan valores numéricos positivos
- [ ] El campo de tipo de ingreso muestra las opciones correctas (Compra, Parte de pago, Consignación)

### Pruebas de integración

- [ ] Al hacer clic en "Guardar" con todos los campos válidos, se realiza una llamada POST a `/api/stock`
- [ ] Si el endpoint devuelve éxito, se muestra una notificación de éxito y se redirige al listado
- [ ] Si el endpoint devuelve error, se muestra el mensaje de error sin cerrar el formulario
- [ ] Al hacer clic en "Cancelar", se cierra el formulario sin realizar llamadas al endpoint
