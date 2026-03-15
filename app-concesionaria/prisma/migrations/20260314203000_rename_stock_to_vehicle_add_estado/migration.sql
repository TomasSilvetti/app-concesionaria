/*
  Warnings:

  - The `Stock` table will be renamed to `Vehicle`
  - A new column `estado` will be added to the `Vehicle` table

*/

-- Step 1: Drop all foreign keys that reference Stock table
ALTER TABLE "OperationExchange" DROP CONSTRAINT IF EXISTS "OperationExchange_stockId_fkey";
ALTER TABLE "VehiclePhoto" DROP CONSTRAINT IF EXISTS "VehiclePhoto_stockId_fkey";
ALTER TABLE "Stock" DROP CONSTRAINT IF EXISTS "Stock_categoriaId_fkey";
ALTER TABLE "Stock" DROP CONSTRAINT IF EXISTS "Stock_marcaId_fkey";
ALTER TABLE "Stock" DROP CONSTRAINT IF EXISTS "Stock_operacionId_fkey";

-- Step 2: Rename table Stock to Vehicle
ALTER TABLE "Stock" RENAME TO "Vehicle";

-- Step 3: Add estado column with default value
ALTER TABLE "Vehicle" ADD COLUMN "estado" TEXT NOT NULL DEFAULT 'disponible';

-- Step 4: Recreate foreign keys with new table name
ALTER TABLE "OperationExchange" ADD CONSTRAINT "OperationExchange_stockId_fkey" 
  FOREIGN KEY ("stockId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_stockId_fkey" 
  FOREIGN KEY ("stockId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_categoriaId_fkey" 
  FOREIGN KEY ("categoriaId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_marcaId_fkey" 
  FOREIGN KEY ("marcaId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_operacionId_fkey" 
  FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
