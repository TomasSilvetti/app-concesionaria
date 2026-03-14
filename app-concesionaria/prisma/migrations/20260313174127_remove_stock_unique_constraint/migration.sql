-- DropIndex
DROP INDEX "Stock_operacionId_key";

-- CreateIndex
CREATE INDEX "Stock_operacionId_idx" ON "Stock"("operacionId");
