# porcion-007 — Tests unitarios de helpers del middleware [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-004
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `src/__tests__/middleware.test.ts` con los tests unitarios para los helpers exportados del middleware: `isPublicPath`, `extractClienteIdFromPath` y `buildLoginUrl`, cubriendo los casos normales y bordes definidos en la HU.

## Ejemplo de uso

Al ejecutar `vitest run`, los tests verifican que `isPublicPath("/login")` retorna `true`, que `isPublicPath("/dashboard")` retorna `false`, que `extractClienteIdFromPath("/clientes/42/operaciones")` retorna `"42"`, y que `buildLoginUrl("/dashboard", true)` incluye el parámetro `expired` en la URL generada.

## Criterios de aceptación

- [ ] Existe el archivo `src/__tests__/middleware.test.ts`
- [ ] Existen tests para `isPublicPath` cubriendo: una ruta pública conocida (ej: `/login`) y una ruta privada (ej: `/dashboard`)
- [ ] Existen tests para `extractClienteIdFromPath` cubriendo: una URL con clienteId válido y una URL sin clienteId (ruta que no lo contiene)
- [ ] Existen tests para `buildLoginUrl` cubriendo: construcción con parámetro `expired=true` y construcción sin ese parámetro
- [ ] Todos los tests pasan al ejecutar `vitest run`
- [ ] Los tests no dependen del objeto `NextRequest` completo ni de la red (usan los helpers de forma aislada con strings simples)

## Pruebas

### Pruebas unitarias

- [ ] `isPublicPath("/login")` retorna `true`
- [ ] `isPublicPath("/dashboard")` retorna `false`
- [ ] `isPublicPath("")` con string vacío no lanza error (retorna `false` o maneja el caso)
- [ ] `extractClienteIdFromPath("/clientes/42/operaciones")` retorna `"42"`
- [ ] `extractClienteIdFromPath("/dashboard")` retorna `null`, `undefined` o string vacío sin lanzar error
- [ ] `buildLoginUrl("/dashboard")` retorna una URL de login con el parámetro `redirect` apuntando a `/dashboard`
- [ ] `buildLoginUrl("/dashboard", true)` retorna una URL de login que incluye el parámetro `expired`
- [ ] `buildLoginUrl("/dashboard", false)` retorna una URL de login que NO incluye el parámetro `expired`

### Pruebas de integración

- [ ] El archivo `middleware.test.ts` se descubre y ejecuta correctamente con la configuración de Vitest de `porcion-001`
- [ ] Los helpers importados desde `src/middleware.ts` se resuelven correctamente sin errores de importación circular
