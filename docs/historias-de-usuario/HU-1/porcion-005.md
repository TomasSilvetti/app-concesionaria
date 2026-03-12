# porcion-005 — Componente Sidebar — persistencia de estado y responsive [BACK]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 12/03/2026

## Descripción

Implementar la lógica para persistir el estado del sidebar en localStorage (para que se mantenga entre sesiones), el cierre automático en mobile al seleccionar una opción, y el manejo del comportamiento overlay con backdrop.

## Ejemplo de uso

Un usuario en desktop abre el sidebar y navega a otra página; el sidebar permanece abierto porque su estado se guardó en localStorage. En mobile, al seleccionar "Operaciones" del sidebar, este se cierra automáticamente. Si el usuario cierra y vuelve a abrir la aplicación, el sidebar mantiene el estado que tenía (abierto en desktop, cerrado en mobile).

## Criterios de aceptación

- [ ] El estado del sidebar (abierto/cerrado) se guarda en localStorage con la key `sidebar-state`
- [ ] Al cargar la aplicación, se recupera el estado del sidebar desde localStorage
- [ ] En mobile, al hacer clic en cualquier opción del sidebar, este se cierra automáticamente
- [ ] En mobile, al hacer clic en el backdrop oscuro, el sidebar se cierra
- [ ] El estado del sidebar persiste al navegar entre páginas de la aplicación
- [ ] Si no hay estado guardado en localStorage, se usa el estado por defecto (abierto en desktop, cerrado en mobile)

## Pruebas

### Pruebas unitarias

- [ ] Al cambiar el estado del sidebar, se guarda correctamente en localStorage
- [ ] Al inicializar el contexto, se lee el estado desde localStorage si existe
- [ ] Si localStorage está vacío, se usa el estado por defecto según el tamaño de pantalla
- [ ] En mobile (`isMobile: true`), al ejecutar una navegación, se invoca `toggle()` para cerrar el sidebar
- [ ] El evento de clic en el backdrop invoca la función `toggle()` solo en mobile

### Pruebas de integración

- [ ] Al navegar entre páginas con el sidebar abierto, el estado se mantiene abierto
- [ ] Al cerrar la aplicación y volver a abrirla, el sidebar recupera el estado guardado
- [ ] En mobile, al seleccionar una opción del sidebar, la navegación ocurre y el sidebar se cierra inmediatamente después
- [ ] Al cambiar de desktop a mobile redimensionando la ventana, el sidebar se cierra automáticamente si estaba abierto
