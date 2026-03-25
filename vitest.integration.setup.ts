import { execSync } from "child_process";
import path from "path";

export async function setup() {
  const dbUrl = process.env.DATABASE_TEST_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_TEST_URL no está definida. " +
        "Corré los tests con: DATABASE_TEST_URL=<url> npm run test:integration"
    );
  }

  console.log("\n⚙ Aplicando migraciones de Prisma en la BD de test...");

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, "app-concesionaria"),
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
      DIRECT_URL: dbUrl,
    },
    stdio: "inherit",
  });
}
