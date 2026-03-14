import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Actualizando tipos de operación...\n");

  const clientes = await prisma.client.findMany({
    select: { id: true, nombre: true }
  });

  if (clientes.length === 0) {
    console.log("⚠️  No se encontraron clientes en la base de datos.");
    return;
  }

  const tiposOperacion = [
    "Venta desde stock",
    "Venta con toma de usado",
    "Venta 0km",
    "A conseguir"
  ];

  for (const cliente of clientes) {
    console.log(`📋 Cliente: ${cliente.nombre} (${cliente.id})`);

    const tiposExistentes = await prisma.operationType.findMany({
      where: { clienteId: cliente.id },
      include: {
        _count: {
          select: { Operation: true }
        }
      }
    });

    if (tiposExistentes.length > 0) {
      console.log(`   Tipos actuales:`);
      tiposExistentes.forEach(tipo => {
        console.log(`   - "${tipo.nombre}" (${tipo._count.Operation} operaciones)`);
      });

      const operacionesHuerfanas = tiposExistentes.reduce(
        (sum, tipo) => sum + tipo._count.Operation, 
        0
      );

      if (operacionesHuerfanas > 0) {
        console.log(`\n   ⚠️  ADVERTENCIA: Hay ${operacionesHuerfanas} operaciones asociadas a tipos antiguos.`);
        console.log(`   Estas operaciones quedarán sin tipo de operación válido.`);
        console.log(`   Asegurate de haber migrado o eliminado estas operaciones antes de continuar.\n`);
        
        throw new Error(`Cliente ${cliente.nombre} tiene operaciones con tipos antiguos. Abortando.`);
      }
    }

    await prisma.operationType.deleteMany({
      where: { clienteId: cliente.id }
    });

    console.log(`   ✓ Tipos antiguos eliminados`);

    for (const nombreTipo of tiposOperacion) {
      await prisma.operationType.create({
        data: {
          id: randomUUID(),
          clienteId: cliente.id,
          nombre: nombreTipo,
        },
      });
      console.log(`   ✓ Tipo creado: "${nombreTipo}"`);
    }

    console.log(`   ✅ Tipos actualizados correctamente\n`);
  }

  console.log("🎉 Migración completada exitosamente!");
  console.log(`\n📊 Resumen:`);
  console.log(`   - ${clientes.length} cliente(s) actualizados`);
  console.log(`   - ${tiposOperacion.length} tipos de operación por cliente`);
  console.log(`   - ${clientes.length * tiposOperacion.length} tipos creados en total`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error en migración:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
