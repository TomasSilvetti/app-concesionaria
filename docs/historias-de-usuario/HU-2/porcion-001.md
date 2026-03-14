# porcion-001 — Página de Operaciones — estructura base [FRONT]

**Historia de usuario:** HU-2: Gestión de Operaciones de Venta de Vehículos
**Par:** porcion-002
**Tipo:** FRONT
**Prerequisitos:** HU-3 completa
**Estado:** ✅ Completada
**Completada el:** 2026-03-13

## Descripción

Crear la página principal de Operaciones con la estructura base: layout, navegación protegida por autenticación, título de página y contenedor donde se renderizará el listado de operaciones.

## Ejemplo de uso

El usuario autenticado hace clic en "Operaciones" en el menú de navegación. El sistema verifica que esté autenticado, carga la página y muestra el título "Gestión de Operaciones" con un área preparada para mostrar el listado.

## Criterios de aceptación

- [ ] La página solo es accesible si el usuario está autenticado
- [ ] Si el usuario no está autenticado, redirige automáticamente a login
- [ ] La página muestra un título "Gestión de Operaciones" o similar
- [ ] La página tiene un contenedor preparado para renderizar el listado de operaciones
- [ ] La página incluye un botón "Nueva operación" visible en la parte superior
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza el título de la página correctamente
- [ ] El botón "Nueva operación" está visible en el componente
- [ ] El contenedor del listado está presente en el DOM

### Pruebas de integración

- [ ] Si el usuario no está autenticado, el guard/middleware redirige a /login
- [ ] Si el usuario está autenticado, la página se renderiza correctamente
- [ ] El botón "Nueva operación" dispara la navegación al formulario de creación (aunque el formulario aún no esté implementado)
