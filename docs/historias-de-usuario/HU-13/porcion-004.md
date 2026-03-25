# porcion-004 — Fix vistas de detalle y edición: mostrar fotos de vehículos de intercambio [FRONT]

**Historia de usuario:** HU-13: Fix vehículos de intercambio — múltiples vehículos, fotos y precio de toma
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-25
**Prerequisitos:** porcion-002

## Descripción

Una vez que el GET devuelva `fotos` en `vehiculosIntercambiados` (porcion-002), la vista de detalle y la vista de edición necesitan mostrarlas. En ambos casos las fotos son solo lectura.

También hay que actualizar las interfaces TypeScript en ambas páginas para incluir `fotos` en `VehicleExchange`.

### Cambios en `src/app/operaciones/[id]/page.tsx`

#### 1. Actualizar la interfaz `VehicleExchange`

```ts
interface VehicleExchange {
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precioNegociado: number | null;
  precioToma: number | null;
  version?: string;
  color?: string;
  kilometros?: number;
  fotos: { id: string; nombreArchivo: string; orden: number }[];  // nuevo
}
```

#### 2. Agregar galería de fotos en la card de cada vehículo

Dentro del `.map((vehicle, index) => ...)` que renderiza cada vehículo (~línea 580), agregar una sección de fotos debajo del `<dl>` de datos:

```tsx
{vehicle.fotos && vehicle.fotos.length > 0 && (
  <div className="mt-4">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
      Fotos
    </p>
    <div className="flex flex-wrap gap-2">
      {vehicle.fotos.map((foto) => (
        <img
          key={foto.id}
          src={`/api/photos/${foto.id}`}
          alt={`Foto ${foto.orden + 1}`}
          className="h-24 w-32 rounded-lg object-cover"
        />
      ))}
    </div>
  </div>
)}
```

### Cambios en `src/app/operaciones/[id]/edit/page.tsx`

#### 1. Actualizar la interfaz `VehicleExchange`

```ts
interface VehicleExchange {
  vehicleId: string;
  marcaId: string;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  precioNegociado: number | null;
  precioToma?: number | null;
  version?: string;
  color?: string;
  kilometros?: number;
  categoriaId?: string;
  fotos: { id: string; nombreArchivo: string; orden: number }[];  // nuevo
}
```

#### 2. Inicializar `fotos` al cargar los datos

En el mapeo de inicialización de `exchangeVehicles` (~línea 216):

```ts
setExchangeVehicles(
  (data.vehiculosIntercambiados || []).map((v: VehicleExchange) => ({
    vehicleId: v.vehicleId,
    marcaId: v.marcaId,
    // ...resto de campos existentes...
    fotos: v.fotos || [],   // nuevo
  }))
);
```

#### 3. Agregar `fotos` a la interfaz `ExchangeVehicleEdit`

```ts
interface ExchangeVehicleEdit {
  // ...campos existentes...
  fotos: { id: string; nombreArchivo: string; orden: number }[];
}
```

#### 4. Mostrar galería de fotos en el formulario de edición de cada vehículo

Dentro del `.map((vehicle, index) => ...)` (~línea 1303), agregar al inicio o al final del bloque del vehículo (fuera del grid de campos):

```tsx
{vehicle.fotos && vehicle.fotos.length > 0 && (
  <div className="mb-4">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
      Fotos
    </p>
    <div className="flex flex-wrap gap-2">
      {vehicle.fotos.map((foto) => (
        <img
          key={foto.id}
          src={`/api/photos/${foto.id}`}
          alt={`Foto ${foto.orden + 1}`}
          className="h-24 w-32 rounded-lg object-cover"
        />
      ))}
    </div>
  </div>
)}
```

## Archivos a modificar

- `src/app/operaciones/[id]/page.tsx`
- `src/app/operaciones/[id]/edit/page.tsx`

## Criterios de aceptación

- [ ] En la vista de detalle, cada vehículo de intercambio muestra su galería de fotos si tiene
- [ ] En la vista de detalle, si un vehículo no tiene fotos, no se muestra la sección de fotos (sin espacio vacío)
- [ ] En la vista de edición, cada vehículo de intercambio muestra sus fotos en modo solo lectura
- [ ] En la vista de edición, si un vehículo no tiene fotos, no se muestra la sección
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Acceder al detalle de una operación con vehículo de intercambio que tenga fotos → verificar que las fotos se muestran
- [ ] Acceder al modo edición de esa misma operación → verificar que las fotos aparecen (sin posibilidad de editarlas)
- [ ] Acceder al detalle de una operación con vehículo de intercambio sin fotos → verificar que no hay sección de fotos vacía
