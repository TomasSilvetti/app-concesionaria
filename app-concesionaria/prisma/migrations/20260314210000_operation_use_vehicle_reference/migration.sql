/*
  Warnings:

  - You are about to drop the columns `modelo`, `anio`, `patente`, `version`, `color`, `kilometros`, `notasMecanicas`, `notasGenerales`, `precioRevista`, `precioOferta` on the `Operation` table.
  - A new column `vehiculoVendidoId` will be added to the `Operation` table.

*/

-- Step 1: Add the new vehiculoVendidoId column (nullable initially to allow data migration)
ALTER TABLE "Operation" ADD COLUMN "vehiculoVendidoId" TEXT;

-- Step 2: For existing operations, create a Vehicle record with the operation's vehicle data
-- and link it via vehiculoVendidoId
DO $$
DECLARE
  op RECORD;
  new_vehicle_id TEXT;
BEGIN
  FOR op IN SELECT id, modelo, anio, patente, version, color, kilometros, "notasMecanicas", "notasGenerales", "precioRevista", "precioOferta", "clienteId", "marcaId", "categoriaId" FROM "Operation" WHERE modelo IS NOT NULL
  LOOP
    -- Generate a new ID for the vehicle
    new_vehicle_id := gen_random_uuid()::TEXT;
    
    -- Insert the vehicle with data from the operation
    INSERT INTO "Vehicle" (
      id, 
      "clienteId", 
      "marcaId", 
      modelo, 
      anio, 
      "categoriaId", 
      patente, 
      version, 
      color, 
      kilometros, 
      "notasMecanicas", 
      "notasGenerales", 
      "precioRevista", 
      "precioOferta", 
      estado, 
      "creadoEn", 
      "actualizadoEn"
    ) VALUES (
      new_vehicle_id,
      op."clienteId",
      op."marcaId",
      op.modelo,
      op.anio,
      op."categoriaId",
      op.patente,
      op.version,
      op.color,
      op.kilometros,
      op."notasMecanicas",
      op."notasGenerales",
      op."precioRevista",
      op."precioOferta",
      'vendido',
      NOW(),
      NOW()
    );
    
    -- Link the operation to the new vehicle
    UPDATE "Operation" SET "vehiculoVendidoId" = new_vehicle_id WHERE id = op.id;
  END LOOP;
END $$;

-- Step 3: Make vehiculoVendidoId NOT NULL
ALTER TABLE "Operation" ALTER COLUMN "vehiculoVendidoId" SET NOT NULL;

-- Step 4: Add foreign key constraint with CASCADE delete
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_vehiculoVendidoId_fkey" 
  FOREIGN KEY ("vehiculoVendidoId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Create index on vehiculoVendidoId
CREATE INDEX "Operation_vehiculoVendidoId_idx" ON "Operation"("vehiculoVendidoId");

-- Step 6: Drop the old vehicle-related columns from Operation
ALTER TABLE "Operation" DROP COLUMN "modelo";
ALTER TABLE "Operation" DROP COLUMN "anio";
ALTER TABLE "Operation" DROP COLUMN "patente";
ALTER TABLE "Operation" DROP COLUMN "version";
ALTER TABLE "Operation" DROP COLUMN "color";
ALTER TABLE "Operation" DROP COLUMN "kilometros";
ALTER TABLE "Operation" DROP COLUMN "notasMecanicas";
ALTER TABLE "Operation" DROP COLUMN "notasGenerales";
ALTER TABLE "Operation" DROP COLUMN "precioRevista";
ALTER TABLE "Operation" DROP COLUMN "precioOferta";
