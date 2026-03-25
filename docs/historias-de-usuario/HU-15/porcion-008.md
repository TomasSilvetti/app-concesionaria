# porcion-008 — CI: service container PostgreSQL y ejecución de tests de integración [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-003, porcion-004, porcion-005, porcion-006, porcion-007

## Descripción

Actualizar el workflow `.github/workflows/tests.yml` para que levante un service container de PostgreSQL 15, corra las migraciones de Prisma contra la BD de test, y ejecute `npm run test:integration` además de los unit tests existentes. Si algún test de integración falla, el workflow bloquea el merge.

## Ejemplo de uso

Al abrir un PR, GitHub Actions ejecuta los unit tests como siempre y además levanta automáticamente un PostgreSQL, aplica las migraciones y corre todos los `*.integration.test.ts`. Si alguno falla, el check queda en rojo y el merge está bloqueado.

## Criterios de aceptación

- [ ] El workflow define un service container `postgres:15` con base de datos `nordem_test`, usuario y contraseña de test
- [ ] El workflow define la variable de entorno `DATABASE_TEST_URL` apuntando al service container
- [ ] El workflow incluye un paso que corre `prisma migrate deploy` (o `prisma db push`) contra la BD de test antes de ejecutar los tests de integración
- [ ] El workflow incluye un paso `Run integration tests` que ejecuta `npm run test:integration`
- [ ] El paso de unit tests y el de integración son pasos separados (no un solo comando)
- [ ] Si `npm run test:integration` falla, el job completo falla y bloquea el merge
- [ ] Los unit tests existentes (`npm test`) siguen corriendo y no se rompen por estos cambios

## Pruebas

### Pruebas unitarias

- [ ] El YAML del workflow es sintácticamente válido (puede validarse con `actionlint` o el linter de GitHub Actions)
- [ ] El `DATABASE_TEST_URL` en el workflow tiene el formato correcto de connection string de PostgreSQL: `postgresql://user:password@localhost:5432/nordem_test`

### Pruebas de integración

- [ ] Al hacer push a una rama con el workflow actualizado, el job `test` en GitHub Actions muestra dos pasos de test: `Run unit tests` y `Run integration tests`
- [ ] Al introducir intencionalmente un test de integración que falla (ej: assertion incorrecta), el workflow falla y no permite merge
- [ ] Al revertir el test roto, el workflow vuelve a pasar en verde
- [ ] El service container de PostgreSQL está disponible en `localhost:5432` desde los steps del job (verificable en el log del paso de migraciones)
