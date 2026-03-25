# porcion-002 — Helpers de test: db, seed y auth [BACK]

**Historia de usuario:** HU-15: Suite de tests de integración para API routes críticas
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001
**Estado:** ✅ Completada
**Completada el:** 2026-03-25

## Descripción

Crear los tres helpers compartidos que todas las suites de integración usarán: `db.ts` (cliente Prisma apuntando a la BD de test), `seed.ts` (funciones para crear datos de prueba: cliente, usuario, operación, vehículo, método de pago, categoría, marca, origen) y `auth.ts` (función para generar JWT de test firmados con `NEXTAUTH_SECRET` sin pasar por el login).

## Ejemplo de uso

Una suite importa `{ db } from './helpers/db'` para consultar la BD directamente, `{ seedCliente, seedOperacion } from './helpers/seed'` para preparar datos, y `{ generarTokenTest } from './helpers/auth'` para obtener un header `Authorization` válido.

## Criterios de aceptación

- [ ] Existe `src/__tests__/integration/helpers/db.ts` que exporta un cliente Prisma conectado a `DATABASE_TEST_URL`
- [ ] Existe `src/__tests__/integration/helpers/seed.ts` con funciones para crear: `Client`, `User`, `Vehicle`, `VehicleBrand`, `VehicleCategory`, `Operation`, `PaymentMethod`, `Category`, `Origin`
- [ ] Cada función de seed recibe parámetros opcionales para sobreescribir valores por defecto y devuelve el objeto creado
- [ ] Existe `src/__tests__/integration/helpers/auth.ts` con una función `generarTokenTest(userId, clienteId, rol)` que genera un JWT válido para NextAuth
- [ ] El JWT generado por `generarTokenTest` es aceptado por el middleware de autenticación de la aplicación
- [ ] Las funciones de seed respetan las foreign keys del schema (ej: crear `Client` antes de `User`, crear `VehicleBrand` y `VehicleCategory` antes de `Vehicle`)

## Pruebas

### Pruebas unitarias

- [ ] `generarTokenTest('user-1', 'cliente-1', 'admin')` devuelve un string JWT con tres segmentos separados por `.`
- [ ] `generarTokenTest` con distintos `userId` genera tokens distintos
- [ ] Cada función de seed en `seed.ts` devuelve un objeto con al menos el campo `id` definido
- [ ] Llamar a una función de seed sin parámetros usa valores por defecto sin lanzar errores de TypeScript

### Pruebas de integración

- [ ] `seedCliente()` crea efectivamente un registro en la tabla `Client` de la BD de test (verificable con `db.client.findUnique`)
- [ ] `seedOperacion({ clienteId })` crea la operación y sus dependencias (marca, categoría, vehículo) en cascada sin violar foreign keys
- [ ] El JWT generado por `generarTokenTest` es decodificado correctamente por el middleware de la app y el request llega autenticado al handler
- [ ] Crear el mismo cliente dos veces con el mismo `id` lanza un error de BD (unicidad), no silencioso
