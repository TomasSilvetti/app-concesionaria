# porcion-001 — Config de Vitest para integración y script npm [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo de configuración de Vitest específico para tests de integración y agregar el script `test:integration` en `package.json`. Esta config apunta exclusivamente a los archivos `*.integration.test.ts` y usa `DATABASE_TEST_URL` como variable de entorno.

## Ejemplo de uso

El developer corre `npm run test:integration` y Vitest ejecuta solo los archivos de la carpeta `integration/`, sin tocar los unit tests existentes.

## Criterios de aceptación

- [ ] Existe el archivo `vitest.config.integration.ts` en la raíz del proyecto
- [ ] El config apunta solo a `app-concesionaria/src/__tests__/integration/**/*.integration.test.ts`
- [ ] El config inyecta `DATABASE_TEST_URL` como `DATABASE_URL` para que Prisma la use automáticamente
- [ ] El script `test:integration` existe en `package.json` y corre `vitest run --config vitest.config.integration.ts`
- [ ] Correr `npm run test:integration` sin archivos de test pasa (passWithNoTests: true) sin errores de config
- [ ] Correr `npm test` (unit tests) no ejecuta ningún archivo `*.integration.test.ts`

## Pruebas

### Pruebas unitarias

- [ ] El archivo `vitest.config.integration.ts` exporta una config válida de Vitest (puede parsearse sin errores)
- [ ] El patrón `include` del config no hace match con `*.test.ts` ni con los unit tests existentes en `src/__tests__/`
- [ ] El patrón `include` hace match con un archivo hipotético `operations.integration.test.ts` dentro de `integration/`

### Pruebas de integración

- [ ] Al correr `npm run test:integration` con `DATABASE_TEST_URL` no definida, Vitest arranca pero Prisma falla con error de conexión claro (no un timeout silencioso)
- [ ] Al correr `npm test` y `npm run test:integration` en secuencia, cada comando solo ejecuta su conjunto de archivos correspondiente
