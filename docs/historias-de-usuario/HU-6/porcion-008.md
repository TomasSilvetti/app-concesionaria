# porcion-008 — Actualizar componentes frontend para trabajar con nuevo modelo [FRONT]

**Historia de usuario:** HU-6: Refactorización del modelo de vehículos
**Par:** —
**Tipo:** FRONT
**Prerequisitos:** porcion-004, porcion-005, porcion-006, porcion-007
**Estado:** ✅ Completada
**Completada el:** 14/03/2026

## Descripción

Actualizar todos los componentes frontend que consumen datos de stock y operaciones para que trabajen con el nuevo modelo de datos: acceder a los datos del vehículo desde `operacion.VehiculoVendido` en lugar de directamente desde `operacion`, y adaptar cualquier lógica que asuma que stock y vehículos son entidades diferentes.

## Ejemplo de uso

El vendedor accede al listado de operaciones, hace clic en una operación para ver su detalle, y el sistema muestra correctamente todos los datos del vehículo (modelo, año, patente, color, etc.) obtenidos desde `operacion.VehiculoVendido.modelo` en lugar de `operacion.modelo`. El listado de stock sigue funcionando normalmente mostrando solo vehículos disponibles.

## Criterios de aceptación

- [ ] El componente de listado de stock funciona correctamente con el modelo `Vehicle` (en lugar de `Stock`)
- [ ] El componente de detalle de operación accede a los datos del vehículo desde `operacion.VehiculoVendido` en lugar de directamente desde `operacion`
- [ ] El componente de listado de operaciones muestra correctamente los datos del vehículo desde la relación `VehiculoVendido`
- [ ] Todos los campos del vehículo (modelo, año, patente, color, kilómetros, notas, precios) se muestran correctamente en los componentes
- [ ] Las fotos del vehículo se obtienen desde `operacion.VehiculoVendido.VehiclePhoto` en lugar de `operacion.OperationPhoto`
- [ ] No hay errores de consola relacionados con propiedades undefined al acceder a datos del vehículo
- [ ] Los componentes manejan correctamente el caso de operaciones sin vehículo asociado (aunque no debería ocurrir)
- [ ] El listado de stock muestra solo vehículos con estado "disponible"
- [ ] Los componentes son responsive y se visualizan correctamente en mobile, tablet y desktop

## Pruebas

### Pruebas unitarias

- [ ] El componente de detalle de operación accede correctamente a `operacion.VehiculoVendido.modelo`
- [ ] El componente de detalle de operación accede correctamente a `operacion.VehiculoVendido.patente`
- [ ] El componente de detalle de operación accede correctamente a `operacion.VehiculoVendido.VehiclePhoto` para mostrar fotos
- [ ] El componente de listado de operaciones muestra correctamente los datos del vehículo desde la relación
- [ ] El componente de listado de stock renderiza correctamente los vehículos del modelo `Vehicle`
- [ ] Los componentes manejan el caso de `VehiculoVendido` null sin romper (aunque no debería ocurrir)

### Pruebas de integración

- [ ] Al cargar el listado de stock, se muestran correctamente los vehículos disponibles
- [ ] Al cargar el listado de operaciones, se muestran correctamente con los datos del vehículo
- [ ] Al hacer clic en una operación, el detalle muestra todos los datos del vehículo correctamente
- [ ] Las fotos del vehículo se muestran correctamente en el detalle de operación
- [ ] Al crear un vehículo desde el módulo stock, aparece inmediatamente en el listado
- [ ] Al crear una operación, el vehículo NO aparece en el listado de stock (porque su estado es "en_proceso")
- [ ] No hay errores de consola ni warnings relacionados con el cambio de modelo
- [ ] Todos los flujos existentes (ver stock, ver operaciones, crear vehículo, crear operación) funcionan correctamente
