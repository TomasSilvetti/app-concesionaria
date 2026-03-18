/*
  Warnings:

  - You are about to drop the column `estado` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `quienPagoEspecial` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `quienPagoUserId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Expense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_quienPagoUserId_fkey";

-- DropIndex
DROP INDEX "Expense_quienPagoUserId_idx";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "estado",
DROP COLUMN "quienPagoEspecial",
DROP COLUMN "quienPagoUserId",
DROP COLUMN "tipo",
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP;
