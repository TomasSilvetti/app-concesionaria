-- CreateTable
CREATE TABLE "RepositorioDocumento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "datos" BYTEA NOT NULL,
    "subidoPorId" TEXT NOT NULL,
    "subidoPorNombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositorioDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepositorioDocumento_clienteId_idx" ON "RepositorioDocumento"("clienteId");

-- AddForeignKey
ALTER TABLE "RepositorioDocumento" ADD CONSTRAINT "RepositorioDocumento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
