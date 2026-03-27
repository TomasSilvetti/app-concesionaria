-- CreateTable
CREATE TABLE "Inversor" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inversor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inversion" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InversionParticipante" (
    "id" TEXT NOT NULL,
    "inversionId" TEXT NOT NULL,
    "inversorId" TEXT,
    "esConcecionaria" BOOLEAN NOT NULL,
    "montoAporte" DOUBLE PRECISION NOT NULL,
    "porcentajeParticipacion" DOUBLE PRECISION NOT NULL,
    "porcentajeUtilidad" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InversionParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inversor_clienteId_idx" ON "Inversor"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Inversion_operacionId_key" ON "Inversion"("operacionId");

-- CreateIndex
CREATE INDEX "Inversion_clienteId_idx" ON "Inversion"("clienteId");

-- CreateIndex
CREATE INDEX "InversionParticipante_inversionId_idx" ON "InversionParticipante"("inversionId");

-- CreateIndex
CREATE INDEX "InversionParticipante_inversorId_idx" ON "InversionParticipante"("inversorId");

-- AddForeignKey
ALTER TABLE "Inversor" ADD CONSTRAINT "Inversor_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inversion" ADD CONSTRAINT "Inversion_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InversionParticipante" ADD CONSTRAINT "InversionParticipante_inversionId_fkey" FOREIGN KEY ("inversionId") REFERENCES "Inversion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InversionParticipante" ADD CONSTRAINT "InversionParticipante_inversorId_fkey" FOREIGN KEY ("inversorId") REFERENCES "Inversor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
