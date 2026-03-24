# porcion-001 — Migración `precioToma` en `OperationExchange` y actualización de endpoints [BACK]

**Historia de usuario:** HU-12: Campo "Precio de Toma" en vehículo intercambiado
**Par:** —
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-03-24
**Prerequisitos:** Ninguno

## Descripción

Agregar el campo `precioToma Float?` al modelo `OperationExchange` en Prisma y actualizar los tres endpoints que interactúan con este modelo para que lean, escriban y devuelvan el nuevo campo.

### Cambios en Prisma

En `prisma/schema.prisma`, agregar `precioToma Float?` al modelo `OperationExchange`:

```prisma
model OperationExchange {
  id              String    @id
  operacionId     String
  stockId         String
  precioNegociado Float?
  precioToma      Float?    // <-- nuevo campo
  creadoEn        DateTime  @default(now())
  actualizadoEn   DateTime
  ...
}
```

Luego ejecutar `npx prisma migrate dev --name add_precio_toma_to_operation_exchange`.

### Cambios en `app/api/operations/route.ts` (POST — crear operación)

En la sección donde se procesa `vehiculoUsado` (alrededor de la línea 660), leer `precioToma` del form data y pasarlo al `create` de `OperationExchange`:

```ts
const usedVehiclePrecioToma = vehiculoUsado.precioToma
  ? parseFloat(vehiculoUsado.precioToma)
  : null;
// ...
precioToma: usedVehiclePrecioToma,
```

### Cambios en `app/api/operations/[id]/route.ts` (GET + PUT — detalle y edición)

**GET** (~línea 144): incluir `precioToma` en el mapeo de `OperationExchange`:
```ts
precioToma: exchange.precioToma,
```

**PUT** (~línea 421): manejar la actualización de `precioToma` al editar un vehículo intercambiado:
```ts
if (ev.precioToma !== undefined) {
  const pt = ev.precioToma === null ? null : typeof ev.precioToma === "number" ? ev.precioToma : null;
  await prisma.operationExchange.update({
    where: { id: ev.id },
    data: { precioToma: pt, actualizadoEn: new Date() },
  });
}
```

Y en el mapeo de respuesta del PUT (~línea 569):
```ts
precioToma: ex.precioToma,
```

## Archivos a modificar

- `prisma/schema.prisma` — agregar `precioToma Float?` al modelo `OperationExchange`
- `src/app/api/operations/route.ts` — leer y guardar `precioToma` al crear
- `src/app/api/operations/[id]/route.ts` — devolver y actualizar `precioToma`

## Criterios de aceptación

- [ ] `npx prisma migrate dev` corre sin errores y genera la columna `precioToma` en `OperationExchange`
- [ ] `POST /api/operations` persiste `precioToma` cuando se envía en el payload del vehículo usado
- [ ] `POST /api/operations` acepta `precioToma: null` sin errores
- [ ] `GET /api/operations/[id]` devuelve `precioToma` en cada objeto de `vehiculosIntercambiados`
- [ ] `PUT /api/operations/[id]` actualiza `precioToma` cuando se envía en `vehiculosIntercambiados`
- [ ] Los registros existentes en `OperationExchange` tienen `precioToma = null` sin errores (campo nullable)

## Pruebas

### Pruebas manuales

- [ ] Crear una operación con vehículo en parte de pago enviando `precioToma` → verificar en BD que el valor se persistió
- [ ] Crear una operación con vehículo en parte de pago sin enviar `precioToma` → verificar que no falla y queda `null`
- [ ] Consultar `GET /api/operations/[id]` de una operación con vehículo intercambiado → verificar que `precioToma` aparece en la respuesta
- [ ] Editar una operación con vehículo intercambiado enviando nuevo `precioToma` → verificar en BD que se actualizó
