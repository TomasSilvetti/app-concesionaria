# porcion-002 — Fix GET + PATCH `/api/operations/[id]`: fotos + `precioToma` desde `Vehicle` [BACK]

**Historia de usuario:** HU-13: Fix vehículos de intercambio — múltiples vehículos, fotos y precio de toma
**Par:** —
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-03-25
**Prerequisitos:** Ninguno

## Descripción

Dos problemas en `src/app/api/operations/[id]/route.ts`:

1. **GET**: el include de `OperationExchange.Vehicle` no incluye `VehiclePhoto`. Las fotos del vehículo de intercambio nunca llegan al frontend. Además, `precioToma` se mapea desde `exchange.precioToma` (OperationExchange) en lugar de `exchange.Vehicle.precioToma` (Vehicle).

2. **PATCH**: cuando se edita un vehículo de intercambio, el `precioToma` se guarda en `OperationExchange` en lugar de en `Vehicle`.

### Cambios en GET (`src/app/api/operations/[id]/route.ts`)

#### 1. Agregar `VehiclePhoto` al include de `OperationExchange.Vehicle`

**Antes:**
```ts
OperationExchange: {
  include: {
    Vehicle: {
      include: {
        VehicleBrand: { select: { nombre: true } },
      },
    },
  },
},
```

**Después:**
```ts
OperationExchange: {
  include: {
    Vehicle: {
      include: {
        VehicleBrand: { select: { nombre: true } },
        VehiclePhoto: {
          orderBy: { orden: "asc" },
        },
      },
    },
  },
},
```

#### 2. Actualizar el mapeo de `vehiculosIntercambiados`

**Antes:**
```ts
vehiculosIntercambiados: operation.OperationExchange.map((exchange) => ({
  vehicleId: exchange.stockId,
  marcaId: exchange.Vehicle.marcaId,
  marca: exchange.Vehicle.VehicleBrand.nombre,
  modelo: exchange.Vehicle.modelo,
  anio: exchange.Vehicle.anio,
  patente: exchange.Vehicle.patente,
  precioNegociado: exchange.precioNegociado,
  precioToma: exchange.precioToma,           // <-- viene de OperationExchange (incorrecto)
  version: exchange.Vehicle.version,
  color: exchange.Vehicle.color,
  kilometros: exchange.Vehicle.kilometros,
})),
```

**Después:**
```ts
vehiculosIntercambiados: operation.OperationExchange.map((exchange) => ({
  vehicleId: exchange.stockId,
  marcaId: exchange.Vehicle.marcaId,
  marca: exchange.Vehicle.VehicleBrand.nombre,
  modelo: exchange.Vehicle.modelo,
  anio: exchange.Vehicle.anio,
  patente: exchange.Vehicle.patente,
  precioNegociado: exchange.precioNegociado,
  precioToma: exchange.Vehicle.precioToma,   // <-- viene de Vehicle (correcto)
  version: exchange.Vehicle.version,
  color: exchange.Vehicle.color,
  kilometros: exchange.Vehicle.kilometros,
  fotos: exchange.Vehicle.VehiclePhoto.map((photo) => ({
    id: photo.id,
    nombreArchivo: photo.nombreArchivo,
    orden: photo.orden,
  })),
})),
```

### Cambios en PATCH (`src/app/api/operations/[id]/route.ts`)

En el bloque que actualiza vehículos de intercambio (~línea 430), cambiar el `precioToma` para que se guarde en `Vehicle` en lugar de en `OperationExchange`:

**Antes:**
```ts
if (ev.precioToma !== undefined) {
  const pt = ev.precioToma === null ? null : typeof ev.precioToma === "number" ? ev.precioToma : null;
  await prisma.operationExchange.update({
    where: { operacionId_stockId: { operacionId: existingOperation.id, stockId: ev.vehicleId } },
    data: { precioToma: pt, actualizadoEn: new Date() },
  });
}
```

**Después:**
```ts
if (ev.precioToma !== undefined) {
  const pt = ev.precioToma === null ? null : typeof ev.precioToma === "number" ? ev.precioToma : null;
  // precioToma se guarda en Vehicle, no en OperationExchange
  await prisma.vehicle.update({
    where: { id: ev.vehicleId },
    data: { precioToma: pt, actualizadoEn: new Date() },
  });
}
```

Nota: este `precioToma` puede consolidarse con el `evUpdate` existente que ya hace un `prisma.vehicle.update`. Evitar dos updates separados al mismo registro si se puede fusionar.

## Archivos a modificar

- `src/app/api/operations/[id]/route.ts`

## Criterios de aceptación

- [ ] `GET /api/operations/[id]` devuelve `fotos` en cada objeto de `vehiculosIntercambiados`
- [ ] `GET /api/operations/[id]` devuelve `precioToma` desde `Vehicle.precioToma` (no desde `OperationExchange.precioToma`)
- [ ] `PATCH /api/operations/[id]` guarda el `precioToma` en `Vehicle.precioToma` al editar
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Consultar `GET /api/operations/[id]` de una operación con vehículo intercambiado → verificar que la respuesta incluye `fotos: [...]` en cada vehículo y que `precioToma` viene de `Vehicle`
- [ ] Editar una operación con vehículo intercambiado cambiando `precioToma` → verificar en BD que el valor se actualizó en `Vehicle.precioToma`
