# porcion-004 — Exportar helpers del middleware [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Modificar `src/middleware.ts` para exportar las funciones helper `isPublicPath`, `extractClienteIdFromPath` y `buildLoginUrl`, que actualmente son funciones internas no testeables. El comportamiento del middleware no debe cambiar.

## Ejemplo de uso

Antes: `isPublicPath` era una función interna anónima o no exportada dentro del middleware. Después: `export function isPublicPath(path: string): boolean { ... }` permite importarla en un test file y verificar su comportamiento para rutas públicas y privadas de forma aislada.

## Criterios de aceptación

- [ ] `isPublicPath` está exportada desde `src/middleware.ts` y es importable en otros módulos
- [ ] `extractClienteIdFromPath` está exportada desde `src/middleware.ts` y es importable en otros módulos
- [ ] `buildLoginUrl` está exportada desde `src/middleware.ts` y es importable en otros módulos
- [ ] El comportamiento del middleware en producción no cambia: las mismas rutas se siguen protegiendo o permitiendo igual que antes
- [ ] Las funciones exportadas son puras o al menos testeables de forma aislada (sin depender del objeto `request` completo de Next.js)

## Pruebas

### Pruebas unitarias

- [ ] Verificar que `isPublicPath` puede importarse desde `src/middleware.ts` sin errores
- [ ] Verificar que `extractClienteIdFromPath` puede importarse desde `src/middleware.ts` sin errores
- [ ] Verificar que `buildLoginUrl` puede importarse desde `src/middleware.ts` sin errores

### Pruebas de integración

- [ ] Al hacer una request a una ruta pública sin sesión, el middleware sigue permitiendo el acceso (comportamiento sin cambios)
- [ ] Al hacer una request a una ruta protegida sin sesión, el middleware sigue redirigiendo al login (comportamiento sin cambios)
