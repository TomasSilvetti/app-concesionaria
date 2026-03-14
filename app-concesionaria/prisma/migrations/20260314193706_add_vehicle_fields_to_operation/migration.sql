/*
  Warnings:

  - Made the column `nombre` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "color" TEXT,
ADD COLUMN     "kilometros" INTEGER,
ADD COLUMN     "notasGenerales" TEXT,
ADD COLUMN     "notasMecanicas" TEXT,
ADD COLUMN     "precioOferta" DOUBLE PRECISION,
ADD COLUMN     "precioRevista" DOUBLE PRECISION,
ADD COLUMN     "version" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nombre" SET NOT NULL;
