# porcion-002 — Workflow de GitHub Actions para CI [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `.github/workflows/tests.yml` que define el pipeline de CI: se dispara en cada push y PR hacia `main`, instala dependencias y ejecuta `vitest run`. Si algún test falla, el workflow queda en rojo y bloquea el merge.

## Ejemplo de uso

El equipo abre un PR hacia `main`. GitHub automáticamente ejecuta el workflow; si todos los tests pasan aparece un check verde que habilita el merge. Si un test falla, aparece un check rojo y el merge queda bloqueado hasta que se corrija.

## Criterios de aceptación

- [ ] Existe el archivo `.github/workflows/tests.yml` en el repositorio
- [ ] El workflow se dispara en eventos `push` y `pull_request` hacia la rama `main`
- [ ] El workflow instala las dependencias del proyecto con `npm ci` antes de correr los tests
- [ ] El workflow ejecuta `npx vitest run` como paso de verificación
- [ ] Si `vitest run` retorna código de error, el workflow queda en estado de falla (rojo)
- [ ] El workflow usa una versión de Node.js compatible con el proyecto

## Pruebas

### Pruebas unitarias

- [ ] Verificar que el YAML del workflow es válido sintácticamente (no tiene errores de indentación ni campos inválidos)
- [ ] Verificar que los triggers (`on: push/pull_request`) apuntan únicamente a la rama `main`

### Pruebas de integración

- [ ] Al hacer push a `main` con todos los tests pasando, el check de GitHub Actions aparece en verde
- [ ] Al hacer push a `main` con un test fallido, el check de GitHub Actions aparece en rojo y el merge queda bloqueado
- [ ] El workflow completa su ejecución en menos de 10 minutos (límite razonable para CI básico)
