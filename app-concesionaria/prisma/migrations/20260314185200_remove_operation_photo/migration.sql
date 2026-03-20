/*
  Warnings:

  - The `OperationPhoto` table will be dropped.
  - The relation between `Operation` and `OperationPhoto` will be removed.

*/

-- DropForeignKey
ALTER TABLE IF EXISTS "OperationPhoto" DROP CONSTRAINT IF EXISTS "OperationPhoto_operationId_fkey";

-- DropTable
DROP TABLE IF EXISTS "OperationPhoto";
