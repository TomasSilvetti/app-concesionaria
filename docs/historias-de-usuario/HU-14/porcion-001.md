# porcion-001 — Configuración de Vitest [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `vitest.config.ts` con la configuración base para que Vitest pueda correr los tests del proyecto correctamente, incluyendo soporte para TypeScript y resolución de paths del proyecto.

## Ejemplo de uso

El equipo ejecuta `vitest run` desde la terminal y el runner detecta todos los archivos `.test.ts` bajo `src/__tests__/`, los ejecuta y muestra el resultado en consola.

## Criterios de aceptación

- [ ] Existe el archivo `vitest.config.ts` en la raíz del proyecto
- [ ] El comando `npx vitest run` se ejecuta sin errores de configuración (aunque no haya tests aún)
- [ ] Vitest resuelve correctamente los paths del proyecto (aliases de `@/` si existen)
- [ ] El entorno de ejecución es compatible con el código del proyecto (Node o jsdom según corresponda)

## Pruebas

### Pruebas unitarias

- [ ] Verificar que `vitest.config.ts` exporta un objeto de configuración válido (no lanza error al importarse)
- [ ] Verificar que el campo `include` apunta al directorio correcto (`src/__tests__/**/*.test.ts` o equivalente)

### Pruebas de integración

- [ ] Al ejecutar `npx vitest run` en el proyecto, el proceso termina con código de salida 0 cuando no hay tests fallidos
- [ ] Al ejecutar `npx vitest run` con un test que falla intencionalmente, el proceso termina con código de salida distinto de 0
