-- CreateTable
CREATE TABLE "OperationPhoto" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "datos" BYTEA NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationPhoto_operationId_idx" ON "OperationPhoto"("operationId");

-- AddForeignKey
ALTER TABLE "OperationPhoto" ADD CONSTRAINT "OperationPhoto_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
