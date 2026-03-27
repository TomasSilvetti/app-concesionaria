# porcion-005 — Endpoint de datos de inversión con cálculo de utilidad neta [BACK]

**Historia de usuario:** HU-18: Inversores en operaciones
**Par:** porcion-004
**Tipo:** BACK
**Prerequisitos:** porcion-001, porcion-003

## Descripción

Exponer un endpoint que devuelva los datos de inversión de una operación junto con la utilidad neta calculada en tiempo real y el detalle de distribución por participante. También manejar la actualización de los porcentajes de utilidad acordados cuando el usuario los edita desde la sección de detalle.

## Ejemplo de uso

El frontend llama a `GET /api/[clienteId]/operaciones/[id]/inversion` y recibe: los datos del resumen financiero (`precioVentaTotal`, `precioToma`, `gastosAsociados`, `utilidadNeta` calculada) y la lista de participantes con `nombre`, `montoAporte`, `porcentajeParticipacion` y `porcentajeUtilidad`. Al editar desde el detalle, se llama a `PATCH` con los nuevos valores.

## Criterios de aceptación

- [ ] `GET /api/[clienteId]/operaciones/[id]/inversion` devuelve los datos financieros de la operación y la distribución de utilidades por participante
- [ ] La `utilidadNeta` se calcula en runtime como `precioVentaTotal - (precioToma ?? 0) - gastosAsociados` y no se persiste
- [ ] Si la operación no tiene inversión registrada, el endpoint devuelve `null` o un objeto con `tieneInversion: false`
- [ ] `PATCH /api/[clienteId]/operaciones/[id]/inversion/participantes` permite actualizar el `porcentajeUtilidad` de uno o más participantes
- [ ] El endpoint valida que la operación pertenezca al `clienteId` recibido
- [ ] Si la operación está cerrada o cancelada, el `PATCH` devuelve error 403

## Pruebas

### Pruebas unitarias

- [ ] El cálculo de `utilidadNeta` retorna el valor correcto con los tres campos informados
- [ ] El cálculo de `utilidadNeta` retorna `precioVentaTotal` cuando `precioToma` y `gastosAsociados` son 0
- [ ] El servicio devuelve `null` cuando la operación existe pero no tiene inversión registrada
- [ ] Se lanza error 403 al intentar hacer PATCH sobre una operación con estado "cerrada" o "cancelada"

### Pruebas de integración

- [ ] `GET` sobre una operación con inversión de 2 participantes devuelve la lista correcta con nombres, montos y porcentajes
- [ ] `GET` sobre una operación sin inversión devuelve respuesta apropiada sin error 500
- [ ] `PATCH` con nuevo `porcentajeUtilidad` para un participante actualiza solo ese campo y devuelve los datos actualizados
- [ ] `GET` sobre una operación de otro `clienteId` devuelve 403 o 404
