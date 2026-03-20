-- Migration: Replace OperationType FK with plain string field
-- Copies the type name from OperationType into Operation, then drops the FK and table.

-- Step 1: Add new column tipoOperacion (nullable initially to populate it)
ALTER TABLE "Operation" ADD COLUMN "tipoOperacion" TEXT;

-- Step 2: Populate tipoOperacion from the joined OperationType table
UPDATE "Operation" o
SET "tipoOperacion" = ot.nombre
FROM "OperationType" ot
WHERE o."tipoOperacionId" = ot.id;

-- Step 3: Set a fallback for any rows that had no matching OperationType
UPDATE "Operation"
SET "tipoOperacion" = 'Venta desde stock'
WHERE "tipoOperacion" IS NULL;

-- Step 4: Make tipoOperacion NOT NULL
ALTER TABLE "Operation" ALTER COLUMN "tipoOperacion" SET NOT NULL;

-- Step 5: Drop the old FK index and column
DROP INDEX IF EXISTS "Operation_tipoOperacionId_idx";
ALTER TABLE "Operation" DROP COLUMN "tipoOperacionId";

-- Step 6: Create new index on tipoOperacion
CREATE INDEX "Operation_tipoOperacion_idx" ON "Operation"("tipoOperacion");

-- Step 7: Drop the OperationType table
DROP TABLE "OperationType";
