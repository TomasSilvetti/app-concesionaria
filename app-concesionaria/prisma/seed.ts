import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const usuarioPassword = await bcrypt.hash("usuario123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: randomUUID(),
      username: "admin",
      password: adminPassword,
      nombre: "Administrador del Sistema",
      rol: "admin",
      clienteId: null,
      activo: true,
      actualizadoEn: new Date(),
    },
  });

  console.log("✅ Usuario administrador creado:", {
    id: admin.id,
    username: admin.username,
    nombre: admin.nombre,
    rol: admin.rol,
  });

  const cliente = await prisma.client.upsert({
    where: { id: "cliente-prueba-001" },
    update: {},
    create: {
      id: "cliente-prueba-001",
      nombre: "Concesionaria Demo",
      activo: true,
      modulos: {
        operaciones: true,
        stock: true,
        gastos: true,
        reportes: true,
      },
      actualizadoEn: new Date(),
    },
  });

  console.log("✅ Cliente de prueba creado:", {
    id: cliente.id,
    nombre: cliente.nombre,
  });

  const usuario = await prisma.user.upsert({
    where: { username: "usuario1" },
    update: {},
    create: {
      id: randomUUID(),
      username: "usuario1",
      password: usuarioPassword,
      nombre: "Usuario de Prueba",
      rol: "usuario",
      clienteId: cliente.id,
      activo: true,
      actualizadoEn: new Date(),
    },
  });

  console.log("✅ Usuario normal creado:", {
    id: usuario.id,
    username: usuario.username,
    nombre: usuario.nombre,
    rol: usuario.rol,
    clienteId: usuario.clienteId,
  });

  const marcaToyota = await prisma.vehicleBrand.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Toyota" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Toyota",
      actualizadoEn: new Date(),
    },
  });

  const marcaFord = await prisma.vehicleBrand.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Ford" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Ford",
      actualizadoEn: new Date(),
    },
  });

  const marcaChevrolet = await prisma.vehicleBrand.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Chevrolet" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Chevrolet",
      actualizadoEn: new Date(),
    },
  });

  const marcaVolkswagen = await prisma.vehicleBrand.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Volkswagen" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Volkswagen",
      actualizadoEn: new Date(),
    },
  });

  console.log("✅ Marcas de vehículos creadas");

  const categoriaSedan = await prisma.vehicleCategory.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Sedan" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Sedan",
    },
  });

  const categoriaHatchback = await prisma.vehicleCategory.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Hatchback" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Hatchback",
    },
  });

  console.log("✅ Categorías de vehículos creadas");

  const tipoCompraVenta = await prisma.operationType.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Compra-Venta" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Compra-Venta",
    },
  });

  const tipoStock = await prisma.operationType.upsert({
    where: { 
      clienteId_nombre: { 
        clienteId: cliente.id, 
        nombre: "Stock" 
      } 
    },
    update: {},
    create: {
      id: randomUUID(),
      clienteId: cliente.id,
      nombre: "Stock",
    },
  });

  console.log("✅ Tipos de operación creados");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📋 Credenciales de prueba:");
  console.log("   Admin: username=admin, password=admin123");
  console.log("   Usuario: username=usuario1, password=usuario123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
