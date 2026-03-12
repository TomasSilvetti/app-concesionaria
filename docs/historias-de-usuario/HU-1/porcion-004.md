# porcion-004 — Componente Sidebar — estructura visual y navegación [FRONT]

**Historia de usuario:** HU-1: Implementar estructura base de la aplicación con navbar y sidebar
**Par:** porcion-005
**Tipo:** FRONT
**Prerequisitos:** porcion-001

## Descripción

Crear el componente visual del sidebar lateral con las opciones de navegación (Dashboard, Operaciones, Stock, Gastos, Clientes, Configuración) y la estructura para mostrar/ocultar según el estado del contexto.

## Ejemplo de uso

El usuario ve un panel lateral con una lista vertical de opciones de navegación. Cada opción tiene un ícono y un texto. La opción activa (página actual) se resalta visualmente. En desktop, el sidebar ocupa un ancho fijo a la izquierda. En mobile, se superpone sobre el contenido con un fondo oscuro semitransparente detrás.

## Criterios de aceptación

- [ ] El sidebar muestra las 6 opciones de navegación: Dashboard, Operaciones, Stock, Gastos, Clientes, Configuración
- [ ] Cada opción tiene un ícono representativo y texto descriptivo
- [ ] La opción correspondiente a la ruta actual se resalta visualmente
- [ ] El sidebar se oculta completamente cuando el estado del contexto es `isOpen: false`
- [ ] En desktop, el sidebar tiene ancho fijo (ej: 240px) y se posiciona a la izquierda
- [ ] En mobile, el sidebar se superpone sobre el contenido como overlay con backdrop oscuro
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente renderiza las 6 opciones de navegación con íconos y textos
- [ ] La opción activa se resalta cuando la ruta actual coincide con su path
- [ ] El sidebar no se renderiza cuando `isOpen` es false
- [ ] En viewport < 768px, el sidebar tiene clase de overlay
- [ ] En viewport >= 768px, el sidebar tiene posición fija lateral
- [ ] Cada opción de navegación es un link funcional con la ruta correcta

### Pruebas de integración

- [ ] Al hacer clic en una opción del sidebar, la navegación cambia a la ruta correspondiente
- [ ] El sidebar lee correctamente el estado `isOpen` del contexto y se muestra/oculta en consecuencia
- [ ] En mobile, al hacer clic en el backdrop oscuro, se cierra el sidebar
