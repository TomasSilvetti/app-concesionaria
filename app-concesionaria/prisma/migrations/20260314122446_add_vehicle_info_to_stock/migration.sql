/*
  Warnings:

  - Added the required column `anio` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoriaId` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marcaId` to the `Stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/

-- Eliminar registros de Stock que no tienen operacionId (registros de prueba sin marca/modelo)
DELETE FROM "Stock" WHERE "operacionId" IS NULL;

-- Agregar columnas como opcionales primero
ALTER TABLE "Stock" ADD COLUMN "anio" INTEGER;
ALTER TABLE "Stock" ADD COLUMN "categoriaId" TEXT;
ALTER TABLE "Stock" ADD COLUMN "marcaId" TEXT;
ALTER TABLE "Stock" ADD COLUMN "modelo" TEXT;
ALTER TABLE "Stock" ADD COLUMN "patente" TEXT;

-- Actualizar registros existentes con datos de sus Operations
UPDATE "Stock" 
SET 
  "marcaId" = "Operation"."marcaId",
  "modelo" = "Operation"."modelo",
  "anio" = "Operation"."anio",
  "categoriaId" = "Operation"."categoriaId",
  "patente" = "Operation"."patente"
FROM "Operation"
WHERE "Stock"."operacionId" = "Operation"."id";

-- Hacer los campos requeridos NOT NULL (excepto patente que es opcional)
ALTER TABLE "Stock" ALTER COLUMN "anio" SET NOT NULL;
ALTER TABLE "Stock" ALTER COLUMN "categoriaId" SET NOT NULL;
ALTER TABLE "Stock" ALTER COLUMN "marcaId" SET NOT NULL;
ALTER TABLE "Stock" ALTER COLUMN "modelo" SET NOT NULL;

-- Crear índices
CREATE INDEX "Stock_marcaId_idx" ON "Stock"("marcaId");
CREATE INDEX "Stock_categoriaId_idx" ON "Stock"("categoriaId");

-- Agregar foreign keys
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
