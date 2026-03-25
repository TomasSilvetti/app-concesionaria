# porcion-003 — Fix `CreateOperationForm`: enviar todos los vehículos de intercambio [FRONT]

**Historia de usuario:** HU-13: Fix vehículos de intercambio — múltiples vehículos, fotos y precio de toma
**Par:** —
**Tipo:** FRONT
**Estado:** ✅ Completada
**Completada el:** 2026-03-25
**Prerequisitos:** porcion-001

## Descripción

Actualmente `handleSubmit` en `CreateOperationForm.tsx` solo toma el primer vehículo del array `tradeInVehicles`:

```ts
// Línea ~549 — BUG: solo envía el primer vehículo
const { photos: tradeInVehiclePhotos, ...vehicleData } = tradeInVehicles[0];
formData.append("vehiculoUsado", JSON.stringify(vehicleData));
tradeInVehiclePhotos.forEach((photo) => {
  formData.append("vehiculoUsadoFotos", photo.file);
});
```

Esta porción reemplaza ese bloque para iterar todos los vehículos del array y enviarlos como `vehiculosUsados` (JSON array) con sus fotos indexadas.

### Cambios en `src/components/operations/CreateOperationForm.tsx`

#### Reemplazar el bloque de envío de vehículos (~línea 549)

**Antes:**
```ts
if (tradeInVehicles.length > 0) {
  const { photos: tradeInVehiclePhotos, ...vehicleData } = tradeInVehicles[0];
  formData.append("vehiculoUsado", JSON.stringify(vehicleData));
  tradeInVehiclePhotos.forEach((photo) => {
    formData.append("vehiculoUsadoFotos", photo.file);
  });
}
```

**Después:**
```ts
if (tradeInVehicles.length > 0) {
  const vehiculosData = tradeInVehicles.map(({ photos: _, ...vehicleData }) => vehicleData);
  formData.append("vehiculosUsados", JSON.stringify(vehiculosData));

  tradeInVehicles.forEach((vehicle, index) => {
    vehicle.photos.forEach((photo) => {
      formData.append(`vehiculosUsadoFotos_${index}`, photo.file);
    });
  });
}
```

## Archivos a modificar

- `src/components/operations/CreateOperationForm.tsx`

## Criterios de aceptación

- [ ] Al crear una operación con 2 vehículos en parte de pago, ambos se persisten en la BD
- [ ] Las fotos de cada vehículo se suben correctamente y quedan asociadas al vehículo correspondiente
- [ ] Al crear con 0 vehículos en parte de pago, la operación se crea sin errores
- [ ] No hay errores de TypeScript ni en consola

## Pruebas

### Pruebas manuales

- [ ] Crear una operación agregando 2 vehículos en parte de pago → verificar en la vista de detalle que aparecen ambos
- [ ] Crear una operación agregando 1 vehículo con fotos → verificar que las fotos aparecen en el detalle (requiere porcion-004 completada)
- [ ] Crear una operación sin vehículos en parte de pago → verificar que no hay errores
