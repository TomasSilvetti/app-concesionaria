/*
  Warnings:

  - The `OperationPhoto` table will be dropped.
  - The relation between `Operation` and `OperationPhoto` will be removed.

*/

-- DropForeignKey
ALTER TABLE "OperationPhoto" DROP CONSTRAINT "OperationPhoto_operationId_fkey";

-- DropTable
DROP TABLE "OperationPhoto";
