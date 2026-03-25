# porcion-005 — Tests unitarios de cálculos financieros [BACK]

**Historia de usuario:** HU-14: Suite de unit tests automatizada con bloqueo en CI
**Par:** —
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-003

## Descripción

Crear el archivo `src/__tests__/calculations.test.ts` con los tests unitarios para las funciones `calcularIngresosNetos` y `calcularComision` del módulo `src/lib/calculations.ts`, cubriendo casos normales y casos borde.

## Ejemplo de uso

Al ejecutar `vitest run`, los tests verifican automáticamente que `calcularIngresosNetos` con precio de venta 100.000 y gastos de 20.000 retorna 80.000, y que `calcularComision` con precio de venta 0 retorna 0 sin lanzar errores.

## Criterios de aceptación

- [ ] Existe el archivo `src/__tests__/calculations.test.ts`
- [ ] Existen tests para `calcularIngresosNetos` cubriendo: caso normal con gastos, sin gastos (lista vacía), y con ingresos netos negativos
- [ ] Existen tests para `calcularComision` cubriendo: caso normal, precio de venta cero (no divide por cero), e ingresos netos negativos
- [ ] Todos los tests pasan al ejecutar `vitest run`
- [ ] Los tests no dependen de base de datos, red ni estado externo (son completamente aislados)

## Pruebas

### Pruebas unitarias

- [ ] `calcularIngresosNetos(precioVenta, gastos)` con valores positivos retorna `precioVenta - suma(gastos)` correctamente
- [ ] `calcularIngresosNetos(precioVenta, [])` sin gastos retorna el precio de venta sin cambios
- [ ] `calcularIngresosNetos` con gastos mayores al precio de venta retorna un número negativo (no lanza error)
- [ ] `calcularComision(precioVenta, ingresosNetos)` con valores positivos retorna el porcentaje correcto
- [ ] `calcularComision(0, ingresosNetos)` retorna 0 sin lanzar excepciones
- [ ] `calcularComision(precioVenta, ingresosNetosNegativos)` maneja el caso sin lanzar error

### Pruebas de integración

- [ ] El archivo `calculations.test.ts` se descubre y ejecuta correctamente con la configuración de Vitest de `porcion-001`
- [ ] Los tests del archivo no interfieren con los de otros archivos de test (no hay estado compartido)
