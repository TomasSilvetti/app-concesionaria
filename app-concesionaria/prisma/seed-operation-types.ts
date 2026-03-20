import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({ select: { id: true, nombre: true } });

  if (clients.length === 0) {
    console.log("❌ No hay clientes en la base de datos. Creá un cliente primero.");
    return;
  }

  for (const client of clients) {
    await prisma.operationType.upsert({
      where: { clienteId_nombre: { clienteId: client.id, nombre: "Venta desde stock" } },
      update: {},
      create: { id: `tipo-venta-stock-${client.id}`, clienteId: client.id, nombre: "Venta desde stock" },
    });
    await prisma.operationType.upsert({
      where: { clienteId_nombre: { clienteId: client.id, nombre: "Venta 0km" } },
      update: {},
      create: { id: `tipo-venta-0km-${client.id}`, clienteId: client.id, nombre: "Venta 0km" },
    });
    console.log(`✅ Tipos de operación creados para: ${client.nombre}`);
  }
}

main().finally(() => prisma.$disconnect());
