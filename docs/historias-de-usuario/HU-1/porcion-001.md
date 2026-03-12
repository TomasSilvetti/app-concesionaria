# porcion-001 — Layout base y sistema de estado del sidebar [BACK]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 12/03/2026

## Descripción

Crear el layout principal de la aplicación que integra navbar, sidebar y área de contenido, junto con el contexto React para manejar el estado compartido del sidebar (abierto/cerrado) y la detección de tamaño de pantalla (mobile/desktop).

## Ejemplo de uso

El layout envuelve toda la aplicación. Cualquier página que se renderice dentro del layout tiene acceso al estado del sidebar mediante un hook `useSidebar()` que devuelve `{ isOpen, toggle, isMobile }`. El navbar y sidebar usan este estado para sincronizar su comportamiento.

## Criterios de aceptación

- [ ] Existe un componente `AppLayout` que estructura la aplicación con áreas para navbar, sidebar y contenido principal
- [ ] Existe un contexto `SidebarContext` que expone el estado del sidebar (abierto/cerrado) y la función para togglearlo
- [ ] El contexto detecta automáticamente si el usuario está en mobile (< 768px) o desktop
- [ ] El hook `useSidebar()` permite acceder al estado desde cualquier componente hijo
- [ ] El estado inicial del sidebar es "abierto" en desktop y "cerrado" en mobile
- [ ] El layout es responsive y ajusta el espacio del contenido según el estado del sidebar

## Pruebas

### Pruebas unitarias

- [ ] El contexto inicializa con `isOpen: true` cuando el ancho de pantalla es >= 768px
- [ ] El contexto inicializa con `isOpen: false` cuando el ancho de pantalla es < 768px
- [ ] La función `toggle()` cambia el estado de `isOpen` de true a false y viceversa
- [ ] El hook `useSidebar()` lanza error si se usa fuera del provider
- [ ] El estado `isMobile` cambia correctamente cuando se redimensiona la ventana cruzando el breakpoint de 768px

### Pruebas de integración

- [ ] Al renderizar el `AppLayout` con contenido hijo, el contenido se muestra en el área principal
- [ ] Al cambiar el estado del sidebar mediante `toggle()`, todos los componentes suscritos al contexto reciben el nuevo estado
- [ ] Al redimensionar la ventana de desktop a mobile, el sidebar se cierra automáticamente si estaba abierto
