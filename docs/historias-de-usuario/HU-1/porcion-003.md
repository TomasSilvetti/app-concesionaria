# porcion-003 — Componente Navbar — lógica interactiva [BACK]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** porcion-002
**Tipo:** BACK
**Prerequisitos:** porcion-001

## Descripción

Implementar la lógica del navbar: funcionalidad de búsqueda, manejo del dropdown de usuario, y conexión con el estado del sidebar para controlar su apertura/cierre mediante el botón hamburguesa.

## Ejemplo de uso

Cuando el usuario hace clic en el botón hamburguesa, el sidebar se abre o cierra según su estado actual. Al escribir en la barra de búsqueda, se filtran resultados en tiempo real (preparación para búsqueda global futura). Al hacer clic en "Cerrar sesión" del dropdown, se ejecuta la acción de logout (preparación para módulo de autenticación).

## Criterios de aceptación

- [ ] El botón hamburguesa llama a la función `toggle()` del contexto del sidebar
- [ ] La barra de búsqueda captura el input del usuario y mantiene el estado local
- [ ] El dropdown de usuario se abre/cierra correctamente al hacer clic
- [ ] Las opciones del dropdown tienen handlers preparados (aunque sin lógica real de autenticación aún)
- [ ] El estado del dropdown se cierra al hacer clic fuera del componente
- [ ] La búsqueda tiene debounce de 300ms para evitar llamadas excesivas

## Pruebas

### Pruebas unitarias

- [ ] Al hacer clic en el botón hamburguesa, se invoca `toggle()` del contexto
- [ ] El estado del dropdown cambia correctamente entre abierto/cerrado
- [ ] El input de búsqueda actualiza su estado local al escribir
- [ ] El debounce de búsqueda espera 300ms antes de procesar el input
- [ ] Al hacer clic fuera del dropdown, este se cierra automáticamente
- [ ] El handler de "Cerrar sesión" se ejecuta correctamente (aunque sin lógica real aún)

### Pruebas de integración

- [ ] Al hacer clic en el botón hamburguesa, el sidebar del layout cambia su estado visual (abierto/cerrado)
- [ ] El estado del sidebar se sincroniza correctamente entre navbar y sidebar mediante el contexto
- [ ] En mobile, al hacer clic en el botón hamburguesa, el sidebar se superpone como overlay
