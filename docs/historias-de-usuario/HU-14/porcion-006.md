# porcion-006 — Tests unitarios de tipos de operación [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear el archivo `src/__tests__/operation-types.test.ts` con los tests unitarios para las funciones `isValidOperationTypeName` y `getOperationTypeByName`, cubriendo los casos normales y casos borde definidos en la HU.

## Ejemplo de uso

Al ejecutar `vitest run`, los tests verifican que `isValidOperationTypeName("Compra")` retorna `true`, que `isValidOperationTypeName(42)` (pasando el id en lugar del nombre) retorna `false`, y que `getOperationTypeByName("Inexistente")` retorna `null` o `undefined` sin lanzar error.

## Criterios de aceptación

- [ ] Existe el archivo `src/__tests__/operation-types.test.ts`
- [ ] Existen tests para `isValidOperationTypeName` cubriendo: un tipo de operación válido por nombre, un id numérico en lugar del nombre (debe retornar false), y string vacío (debe retornar false)
- [ ] Existen tests para `getOperationTypeByName` cubriendo: nombre existente (retorna el objeto correcto) y nombre inexistente (retorna null/undefined sin error)
- [ ] Todos los tests pasan al ejecutar `vitest run`
- [ ] Los tests no dependen de base de datos ni estado externo

## Pruebas

### Pruebas unitarias

- [ ] `isValidOperationTypeName("Compra")` (o el nombre de tipo válido del sistema) retorna `true`
- [ ] `isValidOperationTypeName(1)` pasando el id numérico en lugar del nombre retorna `false`
- [ ] `isValidOperationTypeName("")` con string vacío retorna `false`
- [ ] `getOperationTypeByName("Compra")` retorna el objeto de tipo de operación correspondiente
- [ ] `getOperationTypeByName("TipoQueNoExiste")` retorna `null` o `undefined` sin lanzar excepción

### Pruebas de integración

- [ ] El archivo `operation-types.test.ts` se descubre y ejecuta correctamente con la configuración de Vitest de `porcion-001`
- [ ] Los resultados de los tests son determinísticos: ejecutar la suite dos veces produce el mismo resultado
