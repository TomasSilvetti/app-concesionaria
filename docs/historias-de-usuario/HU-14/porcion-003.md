# porcion-003 — Extracción de cálculos financieros a módulo puro [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno

## Descripción

Extraer la lógica de cálculos financieros que hoy vive inline dentro de las API routes de operaciones hacia un nuevo módulo `src/lib/calculations.ts` con funciones puras exportadas (`calcularIngresosNetos` y `calcularComision`). Las API routes deben quedar usando estas funciones en lugar de la lógica inline, sin cambiar el comportamiento.

## Ejemplo de uso

Antes: la fórmula de comisión estaba hardcodeada dentro del handler de `POST /api/operations`. Después: el handler llama a `calcularComision(precioVenta, ingresosNetos)` importado de `calculations.ts`, y el mismo cálculo puede probarse de forma aislada sin levantar el servidor.

## Criterios de aceptación

- [ ] Existe el archivo `src/lib/calculations.ts` con las funciones `calcularIngresosNetos` y `calcularComision` exportadas
- [ ] Las funciones son puras: reciben parámetros y retornan un valor sin efectos secundarios ni dependencias externas
- [ ] `src/app/api/operations/route.ts` usa las funciones importadas de `calculations.ts` en lugar de lógica inline
- [ ] `src/app/api/operations/[id]/route.ts` usa las funciones importadas de `calculations.ts` en lugar de lógica inline
- [ ] El comportamiento de los endpoints no cambia: los mismos inputs producen los mismos outputs que antes del refactor
- [ ] `calcularComision` no divide por cero cuando el precio de venta es 0 (retorna 0 o maneja el caso explícitamente)

## Pruebas

### Pruebas unitarias

- [ ] Verificar que `calcularIngresosNetos` retorna el valor correcto para un caso normal con gastos asociados
- [ ] Verificar que `calcularIngresosNetos` retorna el valor correcto cuando no hay gastos asociados (lista vacía)
- [ ] Verificar que `calcularComision` retorna el valor correcto para un caso normal
- [ ] Verificar que `calcularComision` retorna 0 (o un valor seguro) cuando el precio de venta es 0, sin lanzar error

### Pruebas de integración

- [ ] Al llamar a `POST /api/operations` con los mismos datos que antes del refactor, la respuesta es idéntica a la anterior
- [ ] Al llamar a `PUT /api/operations/[id]` con los mismos datos que antes del refactor, la respuesta es idéntica a la anterior
