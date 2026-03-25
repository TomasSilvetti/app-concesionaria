import { vi, describe, it, expect, beforeEach } from "vitest";

// ─── Mock de db (Prisma) ─────────────────────────────────────────────────────

const mockCreate = vi.fn();

vi.mock("./db", () => ({
  db: {
    client: { create: vi.fn() },
    user: { create: vi.fn() },
    vehicleBrand: { create: vi.fn() },
    vehicleCategory: { create: vi.fn() },
    vehicle: { create: vi.fn() },
    paymentMethod: { create: vi.fn() },
    category: { create: vi.fn() },
    origin: { create: vi.fn() },
    operation: { create: vi.fn() },
  },
}));

// ─── Mock de next-auth/jwt ────────────────────────────────────────────────────

vi.mock("next-auth/jwt", () => ({
  encode: vi.fn(async ({ token }: { token: { sub: string } }) => {
    // Simula un JWE: 5 segmentos separados por "."
    const payload = Buffer.from(JSON.stringify(token)).toString("base64url");
    return `header.${payload}.encrypted.iv.tag`;
  }),
}));

import { db } from "./db";
import { generarTokenTest } from "./auth";
import {
  seedCliente,
  seedUser,
  seedVehicleBrand,
  seedVehicleCategory,
  seedVehiculo,
  seedPaymentMethod,
  seedCategory,
  seedOrigin,
  seedOperacion,
} from "./seed";

// ─── generarTokenTest ─────────────────────────────────────────────────────────

describe("generarTokenTest", () => {
  it("devuelve un string con segmentos separados por '.'", async () => {
    const token = await generarTokenTest("user-1", "cliente-1", "admin");
    expect(typeof token).toBe("string");
    const partes = token.split(".");
    expect(partes.length).toBeGreaterThanOrEqual(3);
  });

  it("genera tokens distintos para distintos userId", async () => {
    const token1 = await generarTokenTest("user-1", "cliente-1", "admin");
    const token2 = await generarTokenTest("user-2", "cliente-1", "admin");
    expect(token1).not.toBe(token2);
  });

  it("incluye el userId en el payload del token", async () => {
    const token = await generarTokenTest("user-abc", "cliente-1", "usuario");
    // El mock codifica el payload en base64url en la segunda parte
    const payloadB64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    expect(payload.sub).toBe("user-abc");
    expect(payload.id).toBe("user-abc");
  });

  it("acepta clienteId null para usuarios admin sin cliente asociado", async () => {
    await expect(
      generarTokenTest("user-admin", null, "admin")
    ).resolves.toBeDefined();
  });
});

// ─── Funciones de seed ────────────────────────────────────────────────────────

describe("funciones de seed", () => {
  beforeEach(() => {
    // Configurar cada mock para retornar un objeto con id
    (db.client.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-cliente-id",
      nombre: "Cliente Test",
    });
    (db.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-user-id",
      username: "user_test",
    });
    (db.vehicleBrand.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-brand-id",
      nombre: "Marca Test",
    });
    (db.vehicleCategory.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-cat-id",
      nombre: "Categoria Test",
    });
    (db.vehicle.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-vehicle-id",
      modelo: "Modelo Test",
    });
    (db.paymentMethod.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-pm-id",
      nombre: "MetodoPago Test",
    });
    (db.category.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-category-id",
      nombre: "Categoria Gasto Test",
    });
    (db.origin.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-origin-id",
      nombre: "Origen Test",
    });
    (db.operation.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "mock-op-id",
      idOperacion: "OP-12345678",
    });

    mockCreate.mockClear();
  });

  it("seedCliente sin parámetros devuelve objeto con id", async () => {
    const result = await seedCliente();
    expect(result).toHaveProperty("id");
  });

  it("seedUser sin parámetros devuelve objeto con id", async () => {
    const result = await seedUser();
    expect(result).toHaveProperty("id");
  });

  it("seedVehicleBrand sin parámetros devuelve objeto con id", async () => {
    const result = await seedVehicleBrand();
    expect(result).toHaveProperty("id");
  });

  it("seedVehicleCategory sin parámetros devuelve objeto con id", async () => {
    const result = await seedVehicleCategory();
    expect(result).toHaveProperty("id");
  });

  it("seedVehiculo sin parámetros devuelve objeto con id", async () => {
    const result = await seedVehiculo();
    expect(result).toHaveProperty("id");
  });

  it("seedPaymentMethod sin parámetros devuelve objeto con id", async () => {
    const result = await seedPaymentMethod();
    expect(result).toHaveProperty("id");
  });

  it("seedCategory sin parámetros devuelve objeto con id", async () => {
    const result = await seedCategory();
    expect(result).toHaveProperty("id");
  });

  it("seedOrigin sin parámetros devuelve objeto con id", async () => {
    const result = await seedOrigin();
    expect(result).toHaveProperty("id");
  });

  it("seedOperacion sin parámetros devuelve objeto con id", async () => {
    const result = await seedOperacion();
    expect(result).toHaveProperty("id");
  });

  it("seedCliente usa el id provisto en los parámetros", async () => {
    (db.client.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "custom-id",
      nombre: "Mi Cliente",
    });
    const result = await seedCliente({ id: "custom-id", nombre: "Mi Cliente" });
    expect(result.id).toBe("custom-id");
  });
});
