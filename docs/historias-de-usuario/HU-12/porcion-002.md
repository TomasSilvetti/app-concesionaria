# porcion-002 — Campo "Precio de Toma" en formulario de creación de operación [FRONT]

**Historia de usuario:** HU-12: Campo "Precio de Toma" en vehículo intercambiado
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-24
**Prerequisitos:** porcion-001

## Descripción

Agregar el campo "Precio de Toma" al formulario de vehículo en parte de pago dentro de `CreateOperationForm.tsx`. El campo debe estar debajo del campo "Precio Venta Estimado" (que ya existe como `tradeInPrecioNegociado`).

### Cambios en `CreateOperationForm.tsx`

1. **Agregar estado** para el nuevo campo:
```ts
const [tradeInPrecioToma, setTradeInPrecioToma] = useState("");
```

2. **Limpiar el estado** al resetear el formulario de trade-in (en la función que limpia los campos del vehículo usado):
```ts
setTradeInPrecioToma("");
```

3. **Agregar el campo en el JSX**, después del bloque `{/* Precio Negociado */}` (~línea 1156), usando el mismo patrón visual que "Precio Venta Estimado" pero con ícono `sell`:
```tsx
{/* Precio de Toma */}
<div className="flex flex-col gap-2">
  <label htmlFor="tradeInPrecioToma" className="text-sm font-medium text-zinc-700">
    Precio de Toma
  </label>
  <div className="relative">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">sell</span>
    <NumericInput
      id="tradeInPrecioToma"
      value={tradeInPrecioToma}
      onChange={(v) => setTradeInPrecioToma(v)}
      placeholder="0"
      className={...mismo patrón que el campo anterior...}
    />
  </div>
</div>
```

4. **Incluir en el objeto** que se construye al agregar el vehículo (~línea 246):
```ts
precioToma: tradeInPrecioToma || null,
```

5. **Incluir en el formData** al enviar la operación (~línea 458):
```ts
if (tradeInPrecioToma) {
  formData.append("vehiculoUsado.precioToma", tradeInPrecioToma);
}
```

6. **Resetear** junto con los demás campos del trade-in al completar el formulario (~línea 509).

**Nota:** El campo "Precio de Toma" es **opcional** — no agregar validación requerida.

## Archivos a modificar

- `src/components/operations/CreateOperationForm.tsx`

## Criterios de aceptación

- [ ] El formulario de "Agregar vehículo en parte de pago" muestra el campo "Precio de Toma" debajo de "Precio Venta Estimado"
- [ ] El campo "Precio de Toma" acepta valores numéricos
- [ ] El campo "Precio de Toma" es opcional: se puede guardar el vehículo sin completarlo
- [ ] Al limpiar/resetear el formulario de trade-in, el campo "Precio de Toma" se vacía
- [ ] El valor ingresado en "Precio de Toma" se envía en el formData al crear la operación
- [ ] El layout es responsivo y coherente con los demás campos del formulario
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Abrir el formulario de creación de operación → agregar vehículo en parte de pago → verificar que aparece el campo "Precio de Toma"
- [ ] Completar el formulario con "Precio de Toma" → guardar la operación → verificar en la vista de detalle que el valor aparece
- [ ] Completar el formulario sin "Precio de Toma" → guardar la operación → verificar que no falla y el campo queda vacío
- [ ] Limpiar el formulario con el botón X → verificar que "Precio de Toma" se vacía
