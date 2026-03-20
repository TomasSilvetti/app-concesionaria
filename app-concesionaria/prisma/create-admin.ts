import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: "user-admin-001",
      username: "admin",
      password: hash,
      nombre: "Administrador",
      rol: "admin",
      clienteId: null,
      activo: true,
      actualizadoEn: new Date(),
    },
  });
  console.log("✅ Admin creado: admin / admin123");
}

main().finally(() => prisma.$disconnect());
