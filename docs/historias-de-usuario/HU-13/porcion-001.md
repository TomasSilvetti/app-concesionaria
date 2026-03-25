# porcion-001 — Fix POST `/api/operations`: múltiples vehículos de intercambio + `precioToma` en `Vehicle` [BACK]

**Historia de usuario:** HU-13: Fix vehículos de intercambio — múltiples vehículos, fotos y precio de toma
**Par:** —
**Tipo:** BACK
**Estado:** ✅ Completada
**Completada el:** 2026-03-25
**Prerequisitos:** Ninguno

## Descripción

Actualmente el endpoint `POST /api/operations` solo procesa un vehículo de intercambio (`vehiculoUsado`, tomado de `tradeInVehicles[0]`). Además, guarda el `precioToma` en `OperationExchange` en lugar de `Vehicle`.

Esta porción reemplaza el mecanismo de un solo vehículo por un array (`vehiculosUsados`), procesa cada elemento, guarda `precioToma` en `Vehicle`, y crea el pago automático por cada vehículo que tenga `precioToma > 0`.

### Cambios en `src/app/api/operations/route.ts`

#### 1. Reemplazar lectura de `vehiculoUsado` por array `vehiculosUsados`

**Antes:**
```ts
const vehiculoUsadoStr = formData.get("vehiculoUsado") as string | null;
const vehiculoUsadoFotos = formData.getAll("vehiculoUsadoFotos") as File[];
```

**Después:**
```ts
const vehiculosUsadosStr = formData.get("vehiculosUsados") as string | null;
// Las fotos de cada vehículo se envían como "vehiculosUsadoFotos_0", "vehiculosUsadoFotos_1", etc.
```

#### 2. Parsear el array

```ts
let vehiculosUsados: Record<string, string>[] = [];
if (vehiculosUsadosStr) {
  try {
    const parsed = JSON.parse(vehiculosUsadosStr);
    if (Array.isArray(parsed)) {
      vehiculosUsados = parsed;
    }
  } catch {
    return NextResponse.json({ message: "vehiculosUsados tiene formato inválido" }, { status: 400 });
  }
}
```

#### 3. Validación por vehículo

Para cada elemento del array, validar que tenga `marcaId`, `modelo` y `anio`. Si alguno falla, retornar 400.

#### 4. Lógica de creación por vehículo (dentro del `$transaction`)

Reemplazar el bloque `if (vehiculoUsado) { ... }` actual por un loop:

```ts
for (let i = 0; i < vehiculosUsados.length; i++) {
  const vu = vehiculosUsados[i];
  const vuAnio = parseInt(vu.anio, 10);
  const vuKilometros = vu.kilometros ? parseInt(vu.kilometros, 10) : null;
  const vuPrecioRevista = vu.precioRevista ? parseFloat(vu.precioRevista) : null;
  const vuPrecioNegociado = vu.precioNegociado ? parseFloat(vu.precioNegociado) : null;
  const vuPrecioToma = vu.precioToma ? parseFloat(vu.precioToma) : null;

  const usedVehicleId = randomUUID();

  // Crear Vehicle con precioToma en Vehicle (no en OperationExchange)
  await tx.vehicle.create({
    data: {
      id: usedVehicleId,
      clienteId,
      marcaId: vu.marcaId,
      modelo: vu.modelo,
      anio: vuAnio,
      categoriaId: vu.categoriaId || categoriaId,
      patente: vu.patente || null,
      version: vu.version || null,
      color: vu.color || null,
      kilometros: vuKilometros,
      precioRevista: vuPrecioRevista,
      notasMecanicas: vu.notasMecanicas || null,
      notasGenerales: vu.notasGenerales || null,
      precioToma: vuPrecioToma,       // <-- guardado en Vehicle
      estado: "intercambio",
      actualizadoEn: now,
    },
  });

  // Subir fotos del vehículo i
  const vuFotos = formData.getAll(`vehiculosUsadoFotos_${i}`) as File[];
  // ... (mismo patrón que el bloque de fotos actual)

  // Crear OperationExchange SIN precioToma
  await tx.operationExchange.create({
    data: {
      id: randomUUID(),
      operacionId: operationId,
      stockId: usedVehicleId,
      precioNegociado: vuPrecioNegociado,
      // precioToma: NO se guarda aquí
      actualizadoEn: now,
    },
  });

  // Crear pago automático si precioToma > 0
  if (vuPrecioToma && vuPrecioToma > 0) {
    const metodoPagoVehiculo = await tx.paymentMethod.upsert({
      where: { clienteId_nombre: { clienteId, nombre: "Vehiculo tomado" } },
      create: { id: randomUUID(), clienteId, nombre: "Vehiculo tomado" },
      update: {},
    });

    await tx.pago.create({
      data: {
        id: randomUUID(),
        operacionId: operationId,
        clienteId,
        fecha: parsedFechaInicio,
        metodoPagoId: metodoPagoVehiculo.id,
        monto: vuPrecioToma,
        nota: `se descuentan $${vuPrecioToma} del vehiculo tomado como forma de pago`,
        actualizadoEn: now,
      },
    });
  }
}
```

## Archivos a modificar

- `src/app/api/operations/route.ts`

## Criterios de aceptación

- [ ] `POST /api/operations` con `vehiculosUsados` como JSON array de 2 vehículos persiste ambos en la BD
- [ ] El `precioToma` de cada vehículo queda guardado en `Vehicle.precioToma`, no en `OperationExchange.precioToma`
- [ ] `OperationExchange.precioToma` queda `null` para los nuevos registros
- [ ] Se crea un pago automático "Vehiculo tomado" por cada vehículo con `precioToma > 0`
- [ ] Si `vehiculosUsados` está vacío o no se envía, la operación se crea sin vehículos de intercambio sin errores
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Crear una operación enviando `vehiculosUsados` con 2 vehículos → verificar en BD que existen 2 registros en `OperationExchange` y 2 en `Vehicle`, con `precioToma` en `Vehicle`
- [ ] Crear una operación enviando 1 vehículo con `precioToma` → verificar que se generó 1 pago automático
- [ ] Crear una operación sin `vehiculosUsados` → verificar que se crea sin errores y sin registros en `OperationExchange`
