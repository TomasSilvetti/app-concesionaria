# porcion-002 — Límite de 10 fotos en el backend [BACK]

**Historia de usuario:** HU-16: Límite de fotos y selección de imagen principal por vehículo
**Par:** porcion-001
**Tipo:** BACK
**Prerequisitos:** Ninguno
**Estado:** ⬜ Pendiente

## Descripción

Agregar validación de máximo 10 fotos en los endpoints POST (crear vehículo) y PUT (editar vehículo). Esta validación es la defensa a nivel de API, independiente de la UI.

## Archivos a modificar

- `src/app/api/stock/route.ts` — handler POST
- `src/app/api/stock/[id]/route.ts` — handler PUT

## Cambios

### `route.ts` — POST

Después de parsear el FormData y antes de crear el vehículo, validar:

```ts
const fotos = formData.getAll("fotos") as File[];
if (fotos.length > 10) {
  return NextResponse.json(
    { message: "No se pueden cargar más de 10 fotos por vehículo" },
    { status: 400 }
  );
}
```

### `[id]/route.ts` — PUT

Después de parsear el FormData, obtener la cantidad de fotos actuales del vehículo en BD y validar el total:

```ts
const fotos = formData.getAll("fotos") as File[];
const existingCount = await prisma.vehiclePhoto.count({ where: { stockId: id } });
if (existingCount + fotos.length > 10) {
  return NextResponse.json(
    { message: "No se pueden cargar más de 10 fotos por vehículo" },
    { status: 400 }
  );
}
```

## Criterios de aceptación

- [ ] POST con 11 fotos devuelve 400 con mensaje "No se pueden cargar más de 10 fotos por vehículo"
- [ ] POST con 10 fotos devuelve 201 (límite exacto permitido)
- [ ] PUT con vehículo que ya tiene 8 fotos y 3 fotos nuevas devuelve 400
- [ ] PUT con vehículo que ya tiene 8 fotos y 2 fotos nuevas devuelve 200
- [ ] PUT con vehículo que ya tiene 10 fotos y 0 fotos nuevas devuelve 200 (no bloquea actualizaciones sin fotos)

## Pruebas

- [ ] POST con array de 11 archivos en FormData → 400
- [ ] POST con array de 10 archivos en FormData → 201
- [ ] PUT (con vehículo de 8 fotos en BD) con 3 fotos nuevas → 400
- [ ] PUT (con vehículo de 8 fotos en BD) con 2 fotos nuevas → 200
- [ ] PUT (con vehículo de 10 fotos en BD) sin fotos nuevas → 200
