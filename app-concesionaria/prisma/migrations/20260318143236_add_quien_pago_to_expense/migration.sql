/*
  Warnings:

  - You are about to drop the `OperationPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OperationPhoto" DROP CONSTRAINT "OperationPhoto_operationId_fkey";

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "quienPagoEspecial" TEXT,
ADD COLUMN     "quienPagoUserId" TEXT;

-- AlterTable
ALTER TABLE "Operation" ADD COLUMN     "precioToma" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Vehicle" RENAME CONSTRAINT "Stock_pkey" TO "Vehicle_pkey";

-- DropTable
DROP TABLE "OperationPhoto";

-- CreateTable
CREATE TABLE "OperationDocument" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "datos" BYTEA NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pendiente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pendiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationDocument_operacionId_key" ON "OperationDocument"("operacionId");

-- CreateIndex
CREATE INDEX "Pendiente_clienteId_idx" ON "Pendiente"("clienteId");

-- CreateIndex
CREATE INDEX "Expense_quienPagoUserId_idx" ON "Expense"("quienPagoUserId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_quienPagoUserId_fkey" FOREIGN KEY ("quienPagoUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationDocument" ADD CONSTRAINT "OperationDocument_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pendiente" ADD CONSTRAINT "Pendiente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Stock_categoriaId_idx" RENAME TO "Vehicle_categoriaId_idx";

-- RenameIndex
ALTER INDEX "Stock_clienteId_idx" RENAME TO "Vehicle_clienteId_idx";

-- RenameIndex
ALTER INDEX "Stock_marcaId_idx" RENAME TO "Vehicle_marcaId_idx";

-- RenameIndex
ALTER INDEX "Stock_operacionId_idx" RENAME TO "Vehicle_operacionId_idx";
