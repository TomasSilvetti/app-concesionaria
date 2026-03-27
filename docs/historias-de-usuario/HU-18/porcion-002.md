# porcion-002 — Toggle de inversión + subformulario de participantes (UI) [FRONT]

**Historia de usuario:** HU-18: Inversores en operaciones
**Par:** porcion-003
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-27

## Descripción

Agregar al formulario de edición de operación, dentro de la sección "Precios y condiciones comerciales", un toggle que habilita la inversión. Al activarlo se despliega un subformulario con la concesionaria ya listada como participante, donde se pueden agregar inversores, ingresar montos de aporte, ver el porcentaje de participación calculado automáticamente, e ingresar opcionalmente el porcentaje de utilidad acordado.

## Ejemplo de uso

El usuario activa el toggle "¿Hay inversión en esta operación?". Aparece una sección con la concesionaria listada y su campo de monto. El usuario escribe "Juan Pérez" en el buscador, lo selecciona (o lo crea), ingresa su monto y ve que el sistema actualiza automáticamente los porcentajes: "Concesionaria 60% — Juan Pérez 40%". Opcionalmente carga el porcentaje de utilidad acordado para cada uno.

## Criterios de aceptación

- [ ] En la sección "Precios y condiciones comerciales" del formulario de edición aparece un toggle para indicar si hay inversión
- [ ] Al activar el toggle se despliega el subformulario con la concesionaria ya listada como primer participante
- [ ] Hay un campo de búsqueda de inversores para agregar participantes adicionales (la lógica de búsqueda/creación se conecta en porcion-003)
- [ ] Cada participante muestra: nombre, campo de monto de aporte, porcentaje de participación calculado (solo lectura), y campo opcional de porcentaje de utilidad
- [ ] Al modificar cualquier monto, los porcentajes de participación de todos los participantes se recalculan automáticamente en tiempo real
- [ ] Al modificar el porcentaje de utilidad de un participante, no afecta los porcentajes de participación
- [ ] El botón para quitar un participante está disponible para todos excepto la concesionaria
- [ ] El subformulario es accesible solo cuando la operación está en modo edición; en modo lectura se muestra el toggle desactivado o los datos en solo lectura
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] Al activar el toggle, el subformulario se renderiza con la concesionaria como primer participante
- [ ] Al desactivar el toggle, el subformulario se oculta y los datos de participantes se limpian del estado local
- [ ] El cálculo de porcentajes es correcto: si hay 3 participantes con montos $6000, $3000 y $1000, los porcentajes resultantes son 60%, 30% y 10%
- [ ] El porcentaje de participación muestra "—" cuando el total de montos es $0
- [ ] El botón "Quitar" no aparece para el participante concesionaria
- [ ] El campo de porcentaje de utilidad acepta valores decimales entre 0 y 100 y rechaza valores fuera de rango

### Pruebas de integración

- [ ] Los valores del subformulario (montos, porcentajes de utilidad, lista de inversores) se incluyen en el payload al guardar la operación
- [ ] Al cargar una operación con inversión existente en modo edición, el toggle aparece activado y los participantes se muestran con sus datos precargados
- [ ] Al cargar una operación con inversión en modo lectura, el subformulario se muestra bloqueado y no permite edición
