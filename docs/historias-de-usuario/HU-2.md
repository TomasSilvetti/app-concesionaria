# HU-2: Gestión de Operaciones de Venta de Vehículos

**Como** vendedor o administrador del sistema,
**quiero** gestionar operaciones de venta de vehículos con seguimiento completo de datos comerciales y financieros,
**para** tener un registro detallado de cada transacción, calcular ganancias reales y tomar decisiones informadas sobre el negocio.

## Descripción

Esta historia abarca la funcionalidad completa del módulo de Operaciones, que es el núcleo del sistema Nordem. Una operación representa una venta de vehículo y contiene toda la información comercial y financiera asociada: datos del vehículo (marca, modelo, año, patente), fechas de inicio y venta, precios, ingresos brutos, gastos asociados, ganancia neta y comisión calculada.

El módulo permite crear diferentes tipos de operaciones (venta simple, venta con intercambio, venta stock, venta 0km, a conseguir), visualizar un listado completo con filtros y ordenamiento, y acceder a un documento detallado de cada operación para consultar o editar toda su información.

Cuando una operación es de tipo "venta con intercambio", el sistema permite registrar uno o más vehículos usados que se toman como parte de pago, creando registros de stock para cada uno con su precio negociado específico.

## Dependencias

- **Módulo de autenticación (Auth)**: Esta historia requiere que el sistema de autenticación esté implementado, incluyendo login, manejo de sesiones, roles (admin/vendedor) y aislamiento multi-tenant por clienteId.

## Criterios de aceptación

- [ ] El usuario puede acceder a la página de Operaciones solo si está autenticado
- [ ] El usuario solo puede ver operaciones de su propio cliente (aislamiento multi-tenant por clienteId)
- [ ] El listado de operaciones muestra las columnas principales: idOperacion, fechaInicio, fechaVenta, modelo, año, marca, estado, precioVentaTotal, ganancia neta
- [ ] El listado implementa scroll infinito para cargar más operaciones a medida que se desplaza
- [ ] El usuario puede filtrar operaciones por: estado, fecha, marca y tipo de operación
- [ ] El usuario puede ordenar el listado haciendo clic en cualquier columna (fecha, precio, ganancia neta, etc.), alternando entre orden ascendente y descendente
- [ ] El usuario puede crear una nueva operación completando un formulario con todos los campos requeridos
- [ ] Al crear una operación, el sistema calcula automáticamente la ganancia neta como: ingresosBrutos - gastosAsociados
- [ ] Al crear una operación, el sistema calcula automáticamente la comisión como el porcentaje de diferencia entre ganancia neta e ingresosBrutos
- [ ] El usuario puede seleccionar el tipo de operación entre: venta simple, venta con intercambio, venta stock, venta 0km, a conseguir
- [ ] Cuando el tipo de operación es "venta con intercambio", se habilita un segundo formulario para registrar vehículos tomados como parte de pago
- [ ] El usuario puede agregar múltiples vehículos de intercambio a una misma operación
- [ ] Cada vehículo de intercambio crea un nuevo registro en Stock y se asocia a la operación mediante OperationExchange con su precio negociado
- [ ] El sistema valida que la fecha de venta no sea anterior a la fecha de inicio
- [ ] El usuario puede hacer clic en el idOperacion de cualquier fila para ver el documento completo de la operación
- [ ] El usuario puede hacer clic en el botón "editar" de una fila para acceder al documento de operación en modo edición
- [ ] El documento de operación muestra TODA la información de la operación: datos del vehículo, fechas, precios, gastos asociados, intercambios relacionados, cálculos financieros
- [ ] El usuario puede editar los campos de una operación existente desde el documento de operación
- [ ] Al editar una operación, el sistema recalcula automáticamente ganancia neta y comisión si cambió el ingresosBrutos o gastosAsociados
- [ ] Las operaciones se crean con estado "abierta" por defecto
- [ ] El usuario puede cambiar el estado de una operación a: abierta, cerrada, cancelada
- [ ] Los gastos asociados a una operación se actualizan automáticamente cuando se crea un gasto vinculado a esa operación desde el módulo de Gastos

## Flujos

### Flujo principal — Crear operación simple (sin intercambio)

1. El usuario autenticado (admin o vendedor) accede a la página de Operaciones desde el menú de navegación
2. El sistema muestra el listado de operaciones existentes del cliente
3. El usuario hace clic en el botón "Nueva operación" o similar
4. El sistema muestra un formulario con los campos: fechaInicio, modelo, año, patente, precioVentaTotal, ingresosBrutos, marca (selector), categoría (selector), tipo de operación (selector)
5. El usuario completa todos los campos requeridos y selecciona un tipo de operación que NO sea "venta con intercambio"
6. El usuario hace clic en "Guardar" o "Crear operación"
7. El sistema valida los datos ingresados
8. El sistema calcula automáticamente:
   - ganancia neta = ingresosBrutos - gastosAsociados (inicialmente 0)
   - comisión = porcentaje de diferencia entre ganancia neta e ingresosBrutos
9. El sistema crea la operación con estado "abierta" y genera un idOperacion único
10. El sistema redirige al documento de operación o vuelve al listado actualizado
11. El usuario ve la nueva operación en el listado

### Flujo alternativo 1 — Crear operación con intercambio (venta con toma de usado)

1. El usuario sigue los pasos 1-5 del flujo principal, pero selecciona tipo de operación "Venta con intercambio"
2. El usuario completa el formulario principal de la operación
3. El sistema muestra un segundo formulario o sección para registrar el vehículo tomado como parte de pago
4. El usuario completa los datos del vehículo de intercambio: marca, modelo, año, patente, versión, color, kilómetros, precio negociado, notas mecánicas, notas generales
5. El usuario hace clic en "Agregar vehículo de intercambio"
6. El sistema crea un registro de Stock para el vehículo tomado con tipoIngreso = "intercambio"
7. El sistema muestra el vehículo agregado en una lista temporal
8. Si el usuario quiere agregar más vehículos de intercambio, repite los pasos 3-7
9. El usuario hace clic en "Guardar operación"
10. El sistema crea la operación principal
11. El sistema asocia todos los vehículos de intercambio a la operación mediante registros en OperationExchange
12. El sistema redirige al documento de operación mostrando la operación completa con sus intercambios

### Flujo alternativo 2 — Ver, filtrar y ordenar listado de operaciones

1. El usuario accede a la página de Operaciones
2. El sistema muestra el listado de operaciones con scroll infinito
3. El usuario se desplaza hacia abajo y el sistema carga automáticamente más operaciones
4. El usuario aplica uno o más filtros (por estado, fecha, marca, tipo de operación)
5. El sistema actualiza el listado mostrando solo las operaciones que cumplen los criterios
6. El usuario hace clic en el encabezado de una columna (ej: "Fecha de inicio")
7. El sistema ordena el listado de forma descendente (más nuevo primero)
8. El usuario vuelve a hacer clic en la misma columna
9. El sistema invierte el orden a ascendente (más viejo primero)
10. El usuario puede hacer clic en cualquier otra columna para ordenar por ese campo

### Flujo alternativo 3 — Ver documento completo de operación

1. El usuario está en el listado de operaciones
2. El usuario hace clic en el idOperacion de una fila
3. El sistema navega a la página del documento de operación
4. El sistema muestra TODA la información de la operación:
   - Datos del vehículo (marca, modelo, año, patente, categoría)
   - Fechas (inicio, venta, días de venta calculados)
   - Información financiera (precio venta total, ingresos brutos, gastos asociados, ganancia neta, comisión)
   - Tipo de operación y estado
   - Lista de vehículos de intercambio asociados (si los hay) con sus precios negociados
   - Lista de gastos asociados a la operación
5. El usuario puede volver al listado o hacer clic en "Editar"

### Flujo alternativo 4 — Editar operación existente

1. El usuario está en el listado de operaciones
2. El usuario hace clic en el botón "Editar" (ícono de lápiz o similar) de una fila
3. El sistema navega a la página del documento de operación en modo edición
4. El usuario modifica uno o más campos editables (ej: cambia ingresosBrutos, fechaVenta, estado)
5. El usuario hace clic en "Guardar cambios"
6. El sistema valida los datos modificados
7. El sistema recalcula automáticamente ganancia neta y comisión si cambió ingresosBrutos o gastosAsociados
8. El sistema actualiza la operación en la base de datos
9. El sistema muestra un mensaje de confirmación
10. El usuario ve los cambios reflejados en el documento de operación

### Flujo alternativo 5 — Error de validación de fechas

1. El usuario está creando o editando una operación
2. El usuario ingresa una fecha de venta anterior a la fecha de inicio
3. El usuario intenta guardar
4. El sistema detecta la validación fallida
5. El sistema muestra un mensaje de error: "La fecha de venta no puede ser anterior a la fecha de inicio"
6. El usuario corrige la fecha de venta
7. El usuario guarda nuevamente y la operación se crea/actualiza correctamente

### Flujo alternativo 6 — Usuario no autenticado intenta acceder

1. Un usuario no autenticado intenta acceder directamente a la URL /operations
2. El sistema detecta que no hay sesión activa
3. El sistema redirige automáticamente a la página de login
4. El usuario ingresa sus credenciales y se autentica
5. El sistema redirige al usuario a la página de Operaciones
6. El usuario puede ver y gestionar las operaciones de su cliente

### Flujo alternativo 7 — Error al crear operación (validación de campos requeridos)

1. El usuario está creando una nueva operación
2. El usuario deja uno o más campos requeridos vacíos (ej: marca, modelo, fechaInicio)
3. El usuario intenta guardar
4. El sistema detecta campos faltantes
5. El sistema muestra mensajes de error específicos junto a cada campo inválido
6. El usuario completa los campos faltantes
7. El usuario guarda nuevamente y la operación se crea correctamente

### Flujo alternativo 8 — Operación sin resultados en filtros

1. El usuario aplica filtros en el listado de operaciones
2. No existen operaciones que cumplan con los criterios seleccionados
3. El sistema muestra un mensaje: "No se encontraron operaciones con los filtros aplicados"
4. El usuario puede limpiar los filtros o modificarlos para obtener resultados

## Notas técnicas

### Campos calculados automáticamente:
- **Ganancia neta**: `ingresosBrutos - gastosAsociados`
- **Comisión**: Porcentaje de diferencia entre ganancia neta e ingresosBrutos
- **Días de venta**: Diferencia en días entre fechaVenta y fechaInicio (solo si fechaVenta está definida)

### Estados posibles:
- `abierta` (default al crear)
- `cerrada`
- `cancelada`

### Tipos de operación:
- Venta simple
- Venta con intercambio
- Venta stock
- Venta 0km
- A conseguir

### Relaciones importantes:
- Una operación pertenece a un Cliente (multi-tenant)
- Una operación tiene una Marca de vehículo
- Una operación tiene una Categoría de vehículo
- Una operación tiene un Tipo de operación
- Una operación puede tener múltiples Gastos asociados
- Una operación puede tener múltiples Vehículos de intercambio (relación N:N vía OperationExchange)
- Una operación puede tener un registro de Stock asociado (relación 1:1)

### Validaciones de negocio:
- `fechaVenta` no puede ser anterior a `fechaInicio`
- Todos los campos requeridos deben estar completos
- Las foreign keys (marcaId, categoriaId, tipoOperacionId) deben existir en la base de datos
- El clienteId debe corresponder al cliente del usuario autenticado

### Columnas visibles en el listado:
- idOperacion (clickeable para ver documento)
- Fecha de inicio
- Fecha de venta
- Modelo
- Año
- Marca
- Estado (badge con color según estado)
- Precio venta total
- Ganancia neta
- Botón "Editar" por fila

### Filtros disponibles:
- Por estado (abierta, cerrada, cancelada)
- Por rango de fechas
- Por marca
- Por tipo de operación

### Ordenamiento:
- Todas las columnas son ordenables
- Click en columna: orden descendente (más nuevo/mayor primero)
- Segundo click: orden ascendente (más viejo/menor primero)
- Indicador visual de columna activa y dirección de orden
