import { PrismaClient } from "@prisma/client";

// El vitest.config.integration.ts inyecta DATABASE_TEST_URL como DATABASE_URL,
// por lo que este cliente se conecta automáticamente a la BD de test.
export const db = new PrismaClient();
