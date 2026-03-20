# porcion-002 — Campo nombreComprador en formulario nueva operación — vista [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** completado

## Descripción

Agregar el campo `nombreComprador` (texto libre, obligatorio) al formulario de creación de nuevas operaciones (`CreateOperationForm`), con su validación visual y mensaje de error.

## Ejemplo de uso

El usuario abre el formulario de nueva operación. Ve el campo "Nombre del comprador" como campo de texto. Si intenta guardar sin completarlo, aparece el mensaje de error "El nombre del comprador es obligatorio".

## Criterios de aceptación

- [ ] El formulario muestra el campo "Nombre del comprador" (input de texto)
- [ ] El campo es obligatorio: muestra error de validación si se intenta enviar vacío
- [ ] El valor ingresado se incluye en el objeto de datos que el formulario envía al guardar
- [ ] El campo acepta cualquier texto libre (sin restricciones de formato)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El campo aparece renderizado en el formulario
- [ ] Al intentar enviar con `nombreComprador` vacío, el campo muestra el mensaje de validación
- [ ] Al completar el campo y enviar, el valor está presente en los datos enviados al handler de submit
- [ ] El campo no muestra error en el estado inicial (antes del primer intento de envío)

### Pruebas de integración

- [ ] El formulario completo (incluyendo `nombreComprador`) puede enviarse correctamente cuando todos los campos están completos
- [ ] Si el backend devuelve error de validación sobre `nombreComprador`, el formulario lo muestra al usuario
