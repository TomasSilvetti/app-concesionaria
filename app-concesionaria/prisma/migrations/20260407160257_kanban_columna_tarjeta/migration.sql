-- CreateTable
CREATE TABLE "KanbanColumna" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanbanColumna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanTarjeta" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "columnaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT,
    "orden" INTEGER NOT NULL,
    "creadoPorId" TEXT NOT NULL,
    "creadoPorNombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KanbanTarjeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KanbanColumna_clienteId_idx" ON "KanbanColumna"("clienteId");

-- CreateIndex
CREATE INDEX "KanbanTarjeta_columnaId_idx" ON "KanbanTarjeta"("columnaId");

-- CreateIndex
CREATE INDEX "KanbanTarjeta_clienteId_idx" ON "KanbanTarjeta"("clienteId");

-- AddForeignKey
ALTER TABLE "KanbanColumna" ADD CONSTRAINT "KanbanColumna_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTarjeta" ADD CONSTRAINT "KanbanTarjeta_columnaId_fkey" FOREIGN KEY ("columnaId") REFERENCES "KanbanColumna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanTarjeta" ADD CONSTRAINT "KanbanTarjeta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
