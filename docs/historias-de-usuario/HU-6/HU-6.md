# HU-6: Refactorización del modelo de vehículos

**Como** desarrollador del sistema,
**quiero** refactorizar el modelo de datos para centralizar la información de vehículos en una única tabla,
**para** eliminar duplicación de datos, mantener una fuente única de verdad, y permitir el seguimiento completo del ciclo de vida de cada vehículo.

## Descripción

Esta historia refactoriza la arquitectura de datos del sistema para resolver un problema de diseño fundamental: actualmente los datos de los vehículos están duplicados entre la tabla `Stock` (para vehículos disponibles) y la tabla `Operation` (que contiene campos del vehículo que se vende). Esta duplicación genera inconsistencias, dificulta el mantenimiento, y no permite rastrear el historial completo de un vehículo.

La refactorización consiste en:
1. Renombrar la tabla `Stock` a `Vehicle` (que refleja mejor su propósito como tabla maestra de vehículos)
2. Agregar un campo `estado` a `Vehicle` para diferenciar vehículos disponibles ("disponible"), en proceso de venta ("en_proceso") y vendidos ("vendido")
3. Eliminar los campos de vehículo de la tabla `Operation` (modelo, año, patente, color, etc.)
4. Agregar una relación `vehiculoVendidoId` en `Operation` que apunte al vehículo en la tabla `Vehicle`
5. Consolidar todas las fotos de vehículos en `VehiclePhoto` (eliminando `OperationPhoto` si solo se usaba para vehículos)
6. Actualizar todos los endpoints y componentes para trabajar con el nuevo modelo

Con este diseño, todos los vehículos (los que se venden, los que se compran, los que están en stock) viven en una única tabla `Vehicle`, y se diferencian por su campo `estado`. El listado de stock muestra únicamente los vehículos con `estado = "disponible"`. Cuando se consulta una operación, los datos del vehículo se obtienen mediante JOIN en lugar de estar duplicados.

## Criterios de aceptación

- [ ] La tabla `Stock` se renombra a `Vehicle` en el schema de Prisma
- [ ] El modelo `Vehicle` incluye un campo `estado` de tipo String con valores posibles: "disponible", "en_proceso", "vendido"
- [ ] El modelo `Operation` elimina los campos de vehículo (modelo, anio, patente, version, color, kilometros, notasMecanicas, notasGenerales, precioRevista, precioOferta)
- [ ] El modelo `Operation` incluye un campo `vehiculoVendidoId` de tipo String que referencia a `Vehicle`
- [ ] El modelo `Operation` incluye la relación `VehiculoVendido` que apunta a `Vehicle`
- [ ] El modelo `OperationExchange` actualiza su referencia de `stockId` a `vehiculoId` (o mantiene el nombre pero ahora apunta a `Vehicle`)
- [ ] Todas las operaciones existentes en la base de datos se migran correctamente al nuevo modelo sin pérdida de datos
- [ ] El endpoint `GET /api/stock` filtra por `estado = "disponible"` para mostrar solo vehículos disponibles
- [ ] El endpoint `GET /api/operations` incluye los datos del vehículo mediante JOIN con la tabla `Vehicle`
- [ ] El endpoint `POST /api/operations` crea primero el vehículo en `Vehicle` y luego la operación con la referencia
- [ ] Todos los componentes frontend se actualizan para trabajar con el nuevo modelo
- [ ] Las fotos de vehículos se consolidan en `VehiclePhoto` (si `OperationPhoto` solo se usaba para vehículos, se elimina)
- [ ] No hay regresiones en funcionalidad existente después de la refactorización

## Flujos

### Flujo principal — Migración del modelo de datos

1. El desarrollador ejecuta la migración de Prisma que renombra `Stock` a `Vehicle`
2. El desarrollador ejecuta la migración que agrega el campo `estado` a `Vehicle`
3. El desarrollador ejecuta la migración que elimina campos de vehículo de `Operation` y agrega `vehiculoVendidoId`
4. El desarrollador ejecuta el script de migración de datos que:
   - Crea registros en `Vehicle` para cada operación existente con los datos del vehículo
   - Actualiza cada `Operation` para que `vehiculoVendidoId` apunte al vehículo creado
   - Asigna `estado = "vendido"` a los vehículos de operaciones cerradas
   - Asigna `estado = "en_proceso"` a los vehículos de operaciones abiertas
   - Mantiene `estado = "disponible"` para los vehículos que ya estaban en stock
5. El desarrollador verifica que todos los datos se migraron correctamente sin pérdidas

### Flujo principal — Actualización de endpoints

1. El desarrollador actualiza el endpoint `GET /api/stock` para filtrar por `estado = "disponible"`
2. El desarrollador actualiza el endpoint `GET /api/operations` para incluir `VehiculoVendido` mediante JOIN
3. El desarrollador actualiza el endpoint `POST /api/operations` para crear primero el `Vehicle` y luego la `Operation`
4. El desarrollador actualiza el endpoint `POST /api/stock` para crear vehículos con `estado = "disponible"`
5. El desarrollador prueba cada endpoint actualizado para verificar que funciona correctamente

### Flujo principal — Actualización de componentes frontend

1. El desarrollador actualiza el componente de listado de stock para mostrar vehículos con `estado = "disponible"`
2. El desarrollador actualiza el componente de detalle de operación para obtener datos del vehículo desde la relación `VehiculoVendido`
3. El desarrollador actualiza el formulario de operaciones para que cree el vehículo primero
4. El desarrollador verifica que todos los componentes funcionan correctamente con el nuevo modelo

### Flujo alternativo 1 — Consolidación de fotos

1. Si `OperationPhoto` solo se usaba para fotos de vehículos, el desarrollador ejecuta una migración para mover esas fotos a `VehiclePhoto`
2. El desarrollador actualiza los componentes que mostraban fotos de operaciones para que obtengan las fotos desde el vehículo
3. El desarrollador elimina el modelo `OperationPhoto` del schema si ya no es necesario

## Notas técnicas

⚠️ **Migración de datos crítica:** Esta refactorización implica cambios estructurales en el modelo de datos. Es fundamental realizar un backup completo de la base de datos antes de ejecutar las migraciones. El script de migración de datos debe ser idempotente y verificar que no haya pérdida de información.

⚠️ **Transacciones:** Todas las operaciones de creación que involucren múltiples tablas (Vehicle + Operation, Vehicle + OperationExchange) deben ejecutarse dentro de transacciones de Prisma para garantizar consistencia de datos.

⚠️ **Testing exhaustivo:** Después de la refactorización, es necesario probar manualmente todos los flujos existentes (crear operación, ver stock, ver detalle de operación, etc.) para verificar que no haya regresiones.

⚠️ **Fotos:** Analizar si `OperationPhoto` se usa solo para fotos de vehículos o también para otros documentos de la operación (contratos, documentos firmados, etc.). Si es solo para vehículos, consolidar en `VehiclePhoto`. Si tiene otros usos, mantener ambas tablas.
