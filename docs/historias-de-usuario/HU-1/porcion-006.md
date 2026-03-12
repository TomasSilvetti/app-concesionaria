# porcion-006 — Página de bienvenida [FRONT]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-001, porcion-002, porcion-004

## Descripción

Crear la página principal de bienvenida que se muestra al acceder a la ruta raíz de la aplicación. Muestra un mensaje simple de bienvenida y se renderiza dentro del layout con navbar y sidebar.

## Ejemplo de uso

Al acceder a la aplicación en la ruta `/`, el usuario ve el navbar arriba, el sidebar a la izquierda (si está abierto), y en el área de contenido principal aparece un mensaje centrado que dice "Bienvenido a Nordem" con un subtítulo descriptivo.

## Criterios de aceptación

- [ ] La página se renderiza en la ruta raíz `/`
- [ ] Muestra el mensaje "Bienvenido a Nordem" como título principal
- [ ] Incluye un subtítulo descriptivo del sistema (ej: "Sistema de gestión para concesionarias")
- [ ] El contenido está centrado vertical y horizontalmente en el área disponible
- [ ] La página se integra correctamente dentro del `AppLayout`
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza el título "Bienvenido a Nordem"
- [ ] El componente renderiza el subtítulo descriptivo
- [ ] El contenido tiene las clases de centrado correctas
- [ ] El componente no genera errores de renderizado

### Pruebas de integración

- [ ] Al navegar a la ruta `/`, se renderiza la página de bienvenida dentro del layout
- [ ] El navbar y sidebar se muestran correctamente junto con el contenido de bienvenida
- [ ] En mobile, el contenido de bienvenida se ajusta correctamente al espacio disponible cuando el sidebar está abierto como overlay
