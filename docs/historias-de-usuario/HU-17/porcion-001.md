# porcion-001 — Migración VehiclePhoto: agregar campo `datosThumb` [BACK]

**Historia de usuario:** HU-17: Optimización de almacenamiento y carga de fotos de vehículos
**Par:** —
**Tipo:** BACK
**Prerequisitos:** Ninguno
**estado:** ✅ Completada
**Completada el:** 2026-06-15

## Descripción

Agregar el campo `datosThumb` (tipo `Bytes`, opcional) al modelo `VehiclePhoto` en el esquema de Prisma y generar la migración correspondiente. Este campo almacenará la versión thumbnail (400px, WebP) de cada foto. El campo `datos` existente pasa a guardar la versión full (1280px, WebP) para fotos nuevas; las fotos ya existentes seguirán siendo servidas desde `datos` sin cambios.

También se debe cambiar el tipo del campo `mimeType` para que acepte el valor `"image/webp"` (ya existe en el modelo, no requiere cambio de tipo, solo se documentará su uso esperado).

**Archivos a modificar:**
- `prisma/schema.prisma` — agregar `datosThumb Bytes?` al modelo `VehiclePhoto`
- Ejecutar `npx prisma migrate dev --name add-vehicle-photo-thumb`

## Ejemplo de uso

```prisma
model VehiclePhoto {
  id            String   @id
  stockId       String
  nombreArchivo String
  mimeType      String   // "image/webp" para fotos nuevas
  datos         Bytes    // versión full (1280px WebP para fotos nuevas, original para fotos viejas)
  datosThumb    Bytes?   // versión thumbnail (400px WebP), null para fotos pre-migración
  orden         Int      @default(0)
  creadoEn      DateTime @default(now())
  Vehicle       Vehicle  @relation(fields: [stockId], references: [id], onDelete: Cascade)

  @@index([stockId])
}
```

## Criterios de aceptación

- [ ] El campo `datosThumb Bytes?` existe en el modelo `VehiclePhoto` del schema de Prisma.
- [ ] La migración se aplica sin errores en la base de datos local.
- [ ] El campo es opcional (`?`), por lo que los registros existentes no se ven afectados (quedan con `datosThumb = null`).
- [ ] El cliente Prisma se regenera correctamente y el tipo `VehiclePhoto` incluye `datosThumb: Buffer | null`.
- [ ] La aplicación continúa funcionando (sin errores de compilación ni runtime) tras la migración.

## Pruebas

### Pruebas unitarias

1. **Campo nullable en registros existentes:** Consultar un `VehiclePhoto` existente y verificar que `datosThumb` es `null` (no falla el query ni lanza error de tipo).
2. **Creación con datosThumb:** Crear un registro de prueba con `datosThumb` como `Buffer` de bytes arbitrarios y verificar que se persiste y recupera correctamente.

### Pruebas de integración

1. **Migración no destructiva:** Verificar que todos los registros `VehiclePhoto` preexistentes siguen siendo accesibles con sus campos originales intactos tras aplicar la migración.
