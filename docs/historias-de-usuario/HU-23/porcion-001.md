# porcion-001 — Entrada al módulo en sidebar + ruta `/metricas` [FRONT]

**Historia de usuario:** HU-23: Dashboard de Métricas
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-04-09

## Descripción

Agregar el ítem "Métricas" al sidebar de navegación y crear la ruta `/metricas` con una página base vacía que sirva de contenedor para el dashboard.

## Ejemplo de uso

El usuario ve en el sidebar el ítem "Métricas" junto a los demás módulos (Gastos, Cobranzas, etc.). Al hacer clic, navega a `/metricas` y la página se muestra activa en el sidebar.

## Criterios de aceptación

- [ ] El ítem "Métricas" aparece en el sidebar en la posición correcta junto a los demás módulos
- [ ] Al hacer clic en "Métricas" se navega a la ruta `/metricas`
- [ ] El ítem se muestra visualmente activo (resaltado) cuando la ruta actual es `/metricas`
- [ ] La página `/metricas` renderiza sin errores (puede estar vacía o con un placeholder)
- [ ] La ruta está protegida por autenticación (solo usuarios autenticados acceden)
- [ ] El componente es responsive y se visualiza correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El ítem "Métricas" se renderiza en la lista de navegación del sidebar
- [ ] El ítem aplica la clase de estado activo cuando `pathname === "/metricas"`
- [ ] El ítem no aplica la clase activa cuando `pathname` es otra ruta

### Pruebas de integración

- [ ] Al hacer clic en el ítem "Métricas", el router navega a `/metricas`
- [ ] Acceder a `/metricas` sin sesión activa redirige al login
- [ ] Acceder a `/metricas` con sesión activa renderiza la página sin errores
