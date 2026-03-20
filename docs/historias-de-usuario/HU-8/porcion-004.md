# porcion-004 — Dropdown de formas de pago con opción "Agregar nueva" — vista [FRONT]

**Historia de usuario:** HU-8: Módulo de Cobranzas
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**estado:** completado

## Descripción

Crear el componente de selección de forma de pago: un dropdown que lista las formas disponibles para la concesionaria y que permite agregar una nueva opción inline, con validación de duplicados (case-insensitive) antes de enviarla.

## Ejemplo de uso

En el modal de carga de pago, el usuario ve un dropdown "Forma de pago". Al abrirlo, puede elegir una existente (ej: "Efectivo", "Transferencia") o seleccionar "Agregar nueva…". Al elegir esta opción, aparece un input de texto donde escribe el nombre. Si ya existe (ignorando mayúsculas), muestra un error; si es nueva, la agrega al listado y la selecciona automáticamente.

## Criterios de aceptación

- [ ] El componente muestra las formas de pago existentes como opciones seleccionables
- [ ] Incluye una opción especial "Agregar nueva…" al final de la lista
- [ ] Al seleccionar "Agregar nueva…", se revela un input de texto para ingresar el nombre
- [ ] Si el nombre ingresado ya existe (comparación case-insensitive), muestra un mensaje de error y no lo agrega
- [ ] Si el nombre es nuevo, lo agrega a la lista, lo selecciona y llama al callback correspondiente para persistirlo
- [ ] El componente acepta una lista de opciones vía props y un callback `onSelect` y `onAddNew`
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Dado `opciones: ["Efectivo", "Transferencia"]`, el dropdown muestra ambas más "Agregar nueva…"
- [ ] Al intentar agregar "efectivo" (minúsculas) cuando ya existe "Efectivo", muestra error de duplicado y no llama a `onAddNew`
- [ ] Al agregar "Cheque" (no existe), llama a `onAddNew("Cheque")` y selecciona la nueva opción
- [ ] Con lista vacía, el dropdown solo muestra la opción "Agregar nueva…"

### Pruebas de integración

- [ ] Al confirmar un nuevo nombre válido, el componente llama a `onAddNew` con el string correcto y actualiza la lista visible
- [ ] Al seleccionar una opción existente, llama a `onSelect` con el id correcto
