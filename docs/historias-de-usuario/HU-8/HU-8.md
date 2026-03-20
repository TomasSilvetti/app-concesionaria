# HU-8: Módulo de Cobranzas

**Como** usuario de la concesionaria,
**quiero** registrar los pagos parciales de los clientes compradores y visualizar el estado de deuda de cada operación en un módulo de Cobranzas,
**para** llevar un control claro de qué operaciones están saldadas y cuáles tienen deuda pendiente.

---

## Descripción

Se incorpora el módulo de Cobranzas al sistema. Involucra cuatro áreas:

1. **Formulario de nueva operación:** se agrega el campo `nombreComprador`.
2. **Documento de operación:** nueva sección "Cobranzas" (entre Fechas e Información Financiera) con tabla de pagos registrados y botón para agregar nuevos pagos.
3. **Tabla de operaciones:** botón con ícono "$" junto al botón editar, que abre el mismo modal de carga de pago.
4. **Módulo Cobranzas (página):** tabla con filas expandibles que muestran el resumen por operación y el detalle de cada cuota al desplegar.

El monto `saldado` es la suma de todos los pagos registrados para una operación. El `pendiente` se calcula como `precioVentaTotal - saldado`.

---

## Criterios de aceptación

1. El formulario de nueva operación incluye un campo obligatorio `nombreComprador` (texto libre).
2. En el doc de operación existe la sección "Cobranzas" ubicada entre las secciones "Fechas" e "Información Financiera".
3. La sección muestra una tabla con los pagos registrados: fecha, forma de pago, monto y nota.
4. El usuario puede registrar N pagos parciales por operación desde esa sección.
5. El sistema calcula y muestra correctamente `saldado` (suma de pagos) y `pendiente` (`precioVentaTotal - saldado`).
6. El módulo Cobranzas muestra por defecto únicamente las operaciones con deuda pendiente (`pendiente > 0`).
7. Un checkbox "Mostrar todas" permite incluir también las operaciones completamente saldadas.
8. Las operaciones con `pendiente = 0` muestran un ícono indicando que están saldadas.
9. La tabla del módulo tiene filas expandibles:
   - **Fila padre:** `idOperacion` (hipervínculo al doc), `nombreComprador`, `pendiente`, `saldado`.
   - **Filas hijas (una por pago):** `fecha`, `forma de pago`, `monto`, `nota`, `deuda` (saldo restante luego de ese pago).
10. Las formas de pago son un dropdown configurable por concesionaria (`clienteId`), arrancan vacías.
11. El dropdown de formas de pago permite agregar nuevas opciones; el sistema impide duplicados ignorando mayúsculas/minúsculas.
12. La tabla de operaciones muestra un botón con ícono "$" junto al botón editar; al hacer clic abre el mismo modal de carga de pago que el del documento de operación.
13. El modal de carga de pago incluye un botón secundario "Pagó todo" que pre-completa el campo monto con el valor exacto del `pendiente` restante.
14. Al guardar un pago con "Pagó todo" (o cualquier pago que deje `pendiente = 0`), el sistema cambia el `estado` de la operación de `open` a `closed`.

---

## Flujos

### Flujo principal — Registrar un pago en el doc de operación

1. El usuario abre el documento de una operación.
2. Visualiza la sección "Cobranzas" con la tabla de pagos ya registrados (vacía si es la primera vez).
3. Hace clic en "Agregar pago".
4. Se abre el modal de carga de pago con los campos: fecha, forma de pago (dropdown), monto y nota (opcional).
5. Opcionalmente, el usuario hace clic en "Pagó todo": el campo monto se completa automáticamente con el `pendiente` restante.
6. Guarda el pago.
7. El sistema actualiza la tabla de cobranzas y recalcula `saldado` y `pendiente`.
8. Si `pendiente` queda en $0, el sistema cambia el `estado` de la operación a `closed`.

### Flujo alternativo 1b — Registrar pago desde la tabla de operaciones

1. El usuario está en la lista de operaciones.
2. Hace clic en el botón "$" de una operación.
3. Se abre el mismo modal de carga de pago (idéntico al del doc de operación).
4. Completa y guarda el pago siguiendo los mismos pasos del flujo principal (pasos 5-8).

### Flujo alternativo 1 — Agregar nueva forma de pago

1. Al abrir el dropdown de formas de pago, el usuario elige "Agregar nueva".
2. Ingresa el nombre de la nueva forma de pago.
3. El sistema valida que no exista ya (case-insensitive). Si existe, muestra error.
4. Si es válida, la guarda y la selecciona automáticamente.

### Flujo alternativo 2 — Visualizar módulo Cobranzas

1. El usuario navega al módulo Cobranzas.
2. Ve la tabla con las operaciones que tienen deuda pendiente.
3. Puede expandir una fila para ver el detalle de cada cuota (fecha, forma de pago, monto, nota, deuda tras ese pago).
4. Activa el checkbox "Mostrar todas" para incluir operaciones saldadas.
5. Las operaciones saldadas aparecen con un ícono de "saldado".

### Flujo alternativo 3 — Operación saldada (via "Pagó todo" o pago manual)

1. El usuario registra un pago que lleva el `pendiente` a $0 (ya sea usando "Pagó todo" o ingresando el monto manualmente).
2. El sistema cambia el `estado` de la operación a `closed`.
3. La operación permanece visible en el módulo Cobranzas con el ícono de saldado.
4. Al desactivar "Mostrar todas", desaparece de la tabla.

---

## Notas técnicas

⚠️ **Base de datos:**

- Agregar campo `nombreComprador String` al modelo `Operation`.
- Nuevo modelo `PaymentMethod`: `id`, `clienteId`, `nombre` (único case-insensitive por `clienteId`), `creadoEn`.
- Nuevo modelo `Pago`: `id`, `operacionId`, `clienteId`, `fecha`, `metodoPagoId`, `monto Float`, `nota String?`, `creadoEn`, `actualizadoEn`.
- Los campos `saldado` y `pendiente` son **calculados** en runtime (no persistidos): `saldado = SUM(Pago.monto WHERE operacionId)`, `pendiente = precioVentaTotal - saldado`.
- La columna `deuda` en filas hijas se calcula como `precioVentaTotal - SUM(pagos hasta e inclusive ese pago, ordenados por fecha)`.
- Requiere migración de base de datos para `nombreComprador`, `PaymentMethod` y `Pago`.

**Frontend:**
- La tabla expandible del módulo Cobranzas usa un patrón de filas con toggle (padre/hijo), no una navegación separada.
- El checkbox "Mostrar todas" filtra en cliente (o puede ser un query param).
- El dropdown de formas de pago reutiliza el patrón de catálogos existentes (similar a `OperationType`, `VehicleBrand`, etc.).
- El modal de carga de pago es un componente único reutilizado desde el doc de operación y desde la tabla de operaciones.
- El botón "Pagó todo" dentro del modal es secundario/pequeño; al hacer clic solo pre-llena el campo monto, no guarda directamente.
- El campo `estado` de la operación ya existe en el schema (`open`/`closed`); el cierre automático al saldar se gestiona en el backend al persistir el pago.
