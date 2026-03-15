# porcion-003 — Actualizar tipos de operación en base de datos [BACK]

**Historia de usuario:** HU-5: Mejoras en el módulo de operaciones
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Crear un script o migración que actualice los tipos de operación en la base de datos para que reflejen los cuatro tipos específicos requeridos: "Venta desde stock", "Venta con toma de usado", "Venta 0km" y "A conseguir".

## Ejemplo de uso

El desarrollador ejecuta el script de migración/seed, y la tabla `OperationType` se puebla con los cuatro tipos de operación específicos para cada cliente existente en el sistema. Los tipos antiguos se mantienen por compatibilidad pero se marcan como deprecados o se migran a los nuevos según corresponda.

## Criterios de aceptación

- [ ] Se crea un script de seed o migración que inserta los cuatro tipos de operación requeridos
- [ ] Los tipos se crean para cada cliente existente en el sistema
- [ ] Los tipos son: "Venta desde stock", "Venta con toma de usado", "Venta 0km", "A conseguir"
- [ ] El script es idempotente (puede ejecutarse múltiples veces sin duplicar registros)
- [ ] Se documenta en el script cómo manejar los tipos de operación antiguos si existen
- [ ] El script valida que no haya operaciones existentes que queden huérfanas

## Pruebas

### Pruebas unitarias

- [ ] El script verifica correctamente si un tipo de operación ya existe antes de insertarlo
- [ ] El script genera IDs únicos para cada tipo de operación
- [ ] El script asocia correctamente cada tipo de operación con su cliente correspondiente
- [ ] El script maneja correctamente el caso de un cliente sin tipos de operación previos

### Pruebas de integración

- [ ] Al ejecutar el script en una base de datos vacía, se crean los cuatro tipos para cada cliente
- [ ] Al ejecutar el script dos veces consecutivas, no se duplican los registros
- [ ] Los tipos de operación creados son consultables desde el endpoint de tipos de operación
- [ ] Las operaciones existentes mantienen su referencia a tipos válidos después de ejecutar el script
