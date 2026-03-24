# porcion-003 — Campo "Precio de Toma" en edición y vista de solo lectura [FRONT]

**Historia de usuario:** HU-12: Campo "Precio de Toma" en vehículo intercambiado
**Par:** —
**Tipo:** FRONT
**Estado:** Pendiente
**Prerequisitos:** porcion-001

## Descripción

Actualizar el modo edición y la vista de solo lectura de una operación para:
1. Renombrar la etiqueta del campo existente: "Precio Negociado" → "Precio Venta Estimado"
2. Agregar el campo "Precio de Toma" editable (en edición) y como columna (en solo lectura)

### Cambios en `app/operaciones/[id]/edit/page.tsx`

**1. Actualizar el tipo `ExchangeVehicle`** (~línea 42) para incluir el nuevo campo:
```ts
interface ExchangeVehicle {
  // ...campos existentes...
  precioNegociado: string;
  precioToma: string;  // nuevo
}
```

**2. Inicializar `precioToma`** al cargar los vehículos intercambiados (~línea 211):
```ts
precioToma: v.precioToma?.toString() || "",
```

**3. Incluir `precioToma`** en el payload del PUT al guardar (~línea 448):
```ts
precioToma: v.precioToma !== "" ? parseFloat(v.precioToma) : null,
```

**4. Renombrar la etiqueta** del campo existente (~línea 1344):
```tsx
// Antes:
<label className="text-sm font-medium text-zinc-700">Precio Negociado</label>
// Después:
<label className="text-sm font-medium text-zinc-700">Precio Venta Estimado</label>
```

**5. Agregar el campo "Precio de Toma"** después del bloque de "Precio Venta Estimado" (~línea 1361), usando el mismo patrón visual con ícono `sell`:
```tsx
{/* Precio de Toma */}
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-zinc-700">Precio de Toma</label>
  <div className="relative">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">sell</span>
    <input
      type="number"
      step="0.01"
      value={vehicle.precioToma}
      onChange={(e) => {
        const updated = [...exchangeVehicles];
        updated[index] = { ...updated[index], precioToma: e.target.value };
        setExchangeVehicles(updated);
      }}
      disabled={isSaving || isCerrada}
      placeholder="0.00"
      className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
    />
  </div>
</div>
```

### Cambios en `app/operaciones/[id]/page.tsx`

**1. Actualizar el tipo `VehicleExchange`** (~línea 10) para incluir el nuevo campo:
```ts
interface VehicleExchange {
  // ...campos existentes...
  precioNegociado: number | null;
  precioToma: number | null;  // nuevo
}
```

**2. Renombrar el encabezado** de la tabla (~línea 591):
```tsx
// Antes:
Precio Negociado
// Después:
Precio Venta Estimado
```

**3. Agregar columna "Precio de Toma"** en el `<thead>` después de "Precio Venta Estimado":
```tsx
<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600">
  Precio de Toma
</th>
```

**4. Agregar celda** correspondiente en el `<tbody>`:
```tsx
<td className="px-4 py-3 text-right text-sm font-medium text-zinc-900">
  {vehicle.precioToma ? formatCurrency(vehicle.precioToma) : "—"}
</td>
```

## Archivos a modificar

- `src/app/operaciones/[id]/edit/page.tsx` — renombrar etiqueta + agregar campo "Precio de Toma"
- `src/app/operaciones/[id]/page.tsx` — renombrar encabezado de tabla + agregar columna "Precio de Toma"

## Criterios de aceptación

- [ ] En el modo edición, la etiqueta del campo `precioNegociado` dice "Precio Venta Estimado" (ya no "Precio Negociado")
- [ ] En el modo edición, aparece el campo "Precio de Toma" debajo de "Precio Venta Estimado"
- [ ] El campo "Precio de Toma" en edición es opcional (no bloquea el guardado si está vacío)
- [ ] Al guardar desde edición, el valor de "Precio de Toma" se persiste en la BD
- [ ] En la vista de solo lectura, el encabezado de tabla dice "Precio Venta Estimado" (ya no "Precio Negociado")
- [ ] En la vista de solo lectura, hay una columna "Precio de Toma" que muestra el valor o "—" si es nulo
- [ ] El layout es responsivo en ambas vistas
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Entrar al modo edición de una operación con vehículo intercambiado → verificar que la etiqueta dice "Precio Venta Estimado" y aparece el campo "Precio de Toma"
- [ ] Ingresar un valor en "Precio de Toma" → guardar → verificar en la vista de detalle que aparece en la columna correspondiente
- [ ] Dejar "Precio de Toma" vacío → guardar → verificar que no falla y la columna muestra "—"
- [ ] Verificar la vista de solo lectura: encabezado "Precio Venta Estimado" y columna "Precio de Toma" presentes
