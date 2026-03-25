import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock de auth ANTES de importar los route handlers
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { POST } from "@/app/api/stock/route";
import { DELETE } from "@/app/api/stock/[id]/route";
import { GET as GETDisponibles } from "@/app/api/stock/disponibles/route";
import { db } from "./helpers/db";
import {
  seedCliente,
  seedVehicleBrand,
  seedVehicleCategory,
  seedVehiculo,
  seedOperacion,
} from "./helpers/seed";
import { randomUUID } from "crypto";

const mockAuth = vi.mocked(auth);

function makeSession(clienteId: string) {
  return {
    user: { id: "test-user-id", clienteId, rol: "usuario" },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

describe("Suite de integración: API /api/stock", () => {
  // ─── Limpieza antes de cada test en orden que respeta foreign keys ───────────
  beforeEach(async () => {
    await db.operationExchange.deleteMany({});
    await db.pago.deleteMany({});
    await db.operationDocument.deleteMany({});
    await db.operation.deleteMany({});
    await db.expense.deleteMany({});
    await db.vehiclePhoto.deleteMany({});
    await db.vehicle.deleteMany({});
    await db.vehicleBrand.deleteMany({});
    await db.vehicleCategory.deleteMany({});
    await db.paymentMethod.deleteMany({});
    await db.category.deleteMany({});
    await db.origin.deleteMany({});
    await db.user.deleteMany({});
    await db.client.deleteMany({});
  });

  // ─── POST /api/stock ──────────────────────────────────────────────────────────

  describe("POST /api/stock", () => {
    it("con datos válidos devuelve 201 y el vehículo creado tiene el clienteId del usuario autenticado", async () => {
      const cliente = await seedCliente();
      const marca = await seedVehicleBrand({ clienteId: cliente.id });
      const categoria = await seedVehicleCategory({ clienteId: cliente.id });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const formData = new FormData();
      formData.append("marcaId", marca.id);
      formData.append("modelo", "Corolla");
      formData.append("anio", "2022");
      formData.append("categoriaId", categoria.id);
      formData.append("version", "XEI");
      formData.append("color", "Blanco");
      formData.append("kilometros", "15000");
      formData.append("precioRevista", "25000");

      const req = new NextRequest("http://localhost/api/stock", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.vehicle).toBeDefined();
      expect(body.vehicle.id).toBeDefined();

      // Verificar que el registro existe en BD con el clienteId correcto
      const vehicleEnBD = await db.vehicle.findUnique({
        where: { id: body.vehicle.id },
      });
      expect(vehicleEnBD).not.toBeNull();
      expect(vehicleEnBD?.clienteId).toBe(cliente.id);
      expect(vehicleEnBD?.estado).toBe("disponible");
    });

    it("sin token de sesión devuelve 401 y no crea ningún registro en BD", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/stock", {
        method: "POST",
        body: new FormData(),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);

      const count = await db.vehicle.count();
      expect(count).toBe(0);
    });
  });

  // ─── DELETE /api/stock/[id] ───────────────────────────────────────────────────

  describe("DELETE /api/stock/[id]", () => {
    it("vehículo vinculado a una operación devuelve 400 y el vehículo permanece en BD", async () => {
      const cliente = await seedCliente();

      // Crear una operación (genera su propio vehiculoVendido internamente)
      const op = await seedOperacion({ clienteId: cliente.id });

      // Crear un vehículo de stock vinculado a esa operación (como toma/permuta)
      const vehiculoVinculado = await db.vehicle.create({
        data: {
          id: randomUUID(),
          clienteId: cliente.id,
          marcaId: op.marcaId,
          categoriaId: op.categoriaId,
          modelo: "Civic",
          anio: 2019,
          estado: "en_proceso",
          operacionId: op.id,
          actualizadoEn: new Date(),
        },
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        `http://localhost/api/stock/${vehiculoVinculado.id}`,
        { method: "DELETE" }
      );

      const res = await DELETE(req, {
        params: Promise.resolve({ id: vehiculoVinculado.id }),
      });

      expect(res.status).toBe(400);

      // El vehículo sigue existiendo en BD
      const vehicleEnBD = await db.vehicle.findUnique({
        where: { id: vehiculoVinculado.id },
      });
      expect(vehicleEnBD).not.toBeNull();
    });

    it("vehículo libre devuelve 200 y el registro desaparece de BD", async () => {
      const cliente = await seedCliente();
      const marca = await seedVehicleBrand({ clienteId: cliente.id });
      const categoria = await seedVehicleCategory({ clienteId: cliente.id });
      const vehiculoLibre = await seedVehiculo({
        clienteId: cliente.id,
        marcaId: marca.id,
        categoriaId: categoria.id,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        `http://localhost/api/stock/${vehiculoLibre.id}`,
        { method: "DELETE" }
      );

      const res = await DELETE(req, {
        params: Promise.resolve({ id: vehiculoLibre.id }),
      });

      expect(res.status).toBe(200);

      // El vehículo ya no existe en BD
      const vehicleEnBD = await db.vehicle.findUnique({
        where: { id: vehiculoLibre.id },
      });
      expect(vehicleEnBD).toBeNull();
    });
  });

  // ─── GET /api/stock/disponibles ───────────────────────────────────────────────

  describe("GET /api/stock/disponibles", () => {
    it("devuelve solo vehículos con estado 'disponible' del cliente autenticado", async () => {
      const cliente = await seedCliente();
      const marca = await seedVehicleBrand({ clienteId: cliente.id });
      const categoria = await seedVehicleCategory({ clienteId: cliente.id });

      const vehiculoDisponible = await seedVehiculo({
        clienteId: cliente.id,
        marcaId: marca.id,
        categoriaId: categoria.id,
        estado: "disponible",
      });
      await seedVehiculo({
        clienteId: cliente.id,
        marcaId: marca.id,
        categoriaId: categoria.id,
        estado: "vendido",
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest("http://localhost/api/stock/disponibles");
      const res = await GETDisponibles(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.vehicles).toBeDefined();
      expect(body.vehicles).toHaveLength(1);
      expect(body.vehicles[0].id).toBe(vehiculoDisponible.id);
    });

    it("no devuelve vehículos de otro cliente aunque estén disponibles", async () => {
      const clienteA = await seedCliente({ nombre: "Cliente A" });
      const clienteB = await seedCliente({ nombre: "Cliente B" });

      const marcaA = await seedVehicleBrand({ clienteId: clienteA.id });
      const categoriaA = await seedVehicleCategory({ clienteId: clienteA.id });

      // Vehículo del clienteB (no debe aparecer al autenticarse como clienteA)
      await seedVehiculo({ clienteId: clienteB.id, estado: "disponible" });

      // Vehículo propio del clienteA
      const vehiculoPropio = await seedVehiculo({
        clienteId: clienteA.id,
        marcaId: marcaA.id,
        categoriaId: categoriaA.id,
        estado: "disponible",
      });

      mockAuth.mockResolvedValueOnce(makeSession(clienteA.id));

      const req = new NextRequest("http://localhost/api/stock/disponibles");
      const res = await GETDisponibles(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.vehicles).toHaveLength(1);
      expect(body.vehicles[0].id).toBe(vehiculoPropio.id);
    });
  });
});
