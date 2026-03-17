import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Buscando tipos 'A conseguir'...");

  const tipos = await prisma.operationType.findMany({
    where: { nombre: "A conseguir" },
    include: { _count: { select: { Operation: true } } },
  });

  if (tipos.length === 0) {
    console.log("✅ No se encontró ningún tipo 'A conseguir'.");
    return;
  }

  for (const tipo of tipos) {
    if (tipo._count.Operation > 0) {
      console.log(
        `⚠️  El tipo 'A conseguir' (id: ${tipo.id}) tiene ${tipo._count.Operation} operación/es asociadas — no se puede eliminar.`
      );
    } else {
      await prisma.operationType.delete({ where: { id: tipo.id } });
      console.log(`🗑️  Tipo 'A conseguir' eliminado (id: ${tipo.id})`);
    }
  }

  console.log("✅ Listo.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
