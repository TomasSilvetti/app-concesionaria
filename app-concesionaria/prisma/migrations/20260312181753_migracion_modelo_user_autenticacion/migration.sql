-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "modulos" JSONB NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "nombre" TEXT,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "clienteId" TEXT,
    "permisos" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "idOperacion" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaVenta" TIMESTAMP(3),
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "patente" TEXT NOT NULL,
    "precioVentaTotal" DOUBLE PRECISION NOT NULL,
    "ingresosBrutos" DOUBLE PRECISION NOT NULL,
    "comision" DOUBLE PRECISION NOT NULL,
    "gastosAsociados" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ingresosNetos" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'open',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "marcaId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tipoOperacionId" TEXT NOT NULL,
    "diasVenta" INTEGER,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "version" TEXT,
    "color" TEXT,
    "kilometros" INTEGER,
    "tipoIngreso" TEXT NOT NULL,
    "notasMecanicas" TEXT,
    "notasGenerales" TEXT,
    "precioRevista" DOUBLE PRECISION,
    "precioOferta" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationExchange" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "precioNegociado" DOUBLE PRECISION,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationExchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "operacionId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "origenId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Origin" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Origin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBrand" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCategory" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationType" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_clienteId_idx" ON "User"("clienteId");

-- CreateIndex
CREATE INDEX "Operation_clienteId_idx" ON "Operation"("clienteId");

-- CreateIndex
CREATE INDEX "Operation_estado_idx" ON "Operation"("estado");

-- CreateIndex
CREATE INDEX "Operation_marcaId_idx" ON "Operation"("marcaId");

-- CreateIndex
CREATE INDEX "Operation_categoriaId_idx" ON "Operation"("categoriaId");

-- CreateIndex
CREATE INDEX "Operation_tipoOperacionId_idx" ON "Operation"("tipoOperacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Operation_clienteId_idOperacion_key" ON "Operation"("clienteId", "idOperacion");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_operacionId_key" ON "Stock"("operacionId");

-- CreateIndex
CREATE INDEX "Stock_clienteId_idx" ON "Stock"("clienteId");

-- CreateIndex
CREATE INDEX "OperationExchange_operacionId_idx" ON "OperationExchange"("operacionId");

-- CreateIndex
CREATE INDEX "OperationExchange_stockId_idx" ON "OperationExchange"("stockId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationExchange_operacionId_stockId_key" ON "OperationExchange"("operacionId", "stockId");

-- CreateIndex
CREATE INDEX "Expense_clienteId_idx" ON "Expense"("clienteId");

-- CreateIndex
CREATE INDEX "Expense_operacionId_idx" ON "Expense"("operacionId");

-- CreateIndex
CREATE INDEX "Expense_categoriaId_idx" ON "Expense"("categoriaId");

-- CreateIndex
CREATE INDEX "Expense_origenId_idx" ON "Expense"("origenId");

-- CreateIndex
CREATE INDEX "Category_clienteId_idx" ON "Category"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_clienteId_nombre_key" ON "Category"("clienteId", "nombre");

-- CreateIndex
CREATE INDEX "Origin_clienteId_idx" ON "Origin"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Origin_clienteId_nombre_key" ON "Origin"("clienteId", "nombre");

-- CreateIndex
CREATE INDEX "VehicleBrand_clienteId_idx" ON "VehicleBrand"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBrand_clienteId_nombre_key" ON "VehicleBrand"("clienteId", "nombre");

-- CreateIndex
CREATE INDEX "VehicleCategory_clienteId_idx" ON "VehicleCategory"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategory_clienteId_nombre_key" ON "VehicleCategory"("clienteId", "nombre");

-- CreateIndex
CREATE INDEX "OperationType_clienteId_idx" ON "OperationType"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationType_clienteId_nombre_key" ON "OperationType"("clienteId", "nombre");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operation" ADD CONSTRAINT "Operation_tipoOperacionId_fkey" FOREIGN KEY ("tipoOperacionId") REFERENCES "OperationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationExchange" ADD CONSTRAINT "OperationExchange_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationExchange" ADD CONSTRAINT "OperationExchange_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "Operation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "Origin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Origin" ADD CONSTRAINT "Origin_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleBrand" ADD CONSTRAINT "VehicleBrand_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategory" ADD CONSTRAINT "VehicleCategory_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationType" ADD CONSTRAINT "OperationType_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
