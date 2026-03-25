import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock de auth ANTES de importar los route handlers
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/operations/route";
import { PATCH } from "@/app/api/operations/[id]/route";
import { db } from "./helpers/db";
import {
  seedCliente,
  seedVehicleBrand,
  seedVehicleCategory,
  seedOperacion,
} from "./helpers/seed";

const mockAuth = vi.mocked(auth);

function makeSession(clienteId: string) {
  return {
    user: { id: "test-user-id", clienteId, rol: "usuario" },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

describe("Suite de integración: API /api/operations", () => {
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

  // ─── POST /api/operations ────────────────────────────────────────────────────

  describe("POST /api/operations", () => {
    it("con datos válidos devuelve 201 y el body contiene los campos de la operación creada", async () => {
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
      formData.append("kilometros", "10000");
      formData.append("precioRevista", "20000");
      formData.append("nombreComprador", "Juan Pérez");
      formData.append("tipoOperacion", "Venta desde stock");
      formData.append("fechaInicio", "2026-01-15");
      formData.append("precioVentaTotal", "18000");
      formData.append("ingresosBrutos", "3000");

      const req = new NextRequest("http://localhost/api/operations", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.operation).toBeDefined();
      expect(body.operation.idOperacion).toBeDefined();
      expect(body.operation.nombreComprador).toBe("Juan Pérez");
      expect(body.operation.ingresosNetos).toBeDefined();
      expect(body.operation.comision).toBeDefined();

      // Verificar que el registro existe efectivamente en la BD
      const opEnBD = await db.operation.findFirst({
        where: { idOperacion: body.operation.idOperacion },
      });
      expect(opEnBD).not.toBeNull();
      expect(opEnBD?.nombreComprador).toBe("Juan Pérez");
    });

    it("con tipoOperacion inválido devuelve 400", async () => {
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
      formData.append("kilometros", "10000");
      formData.append("precioRevista", "20000");
      formData.append("nombreComprador", "Juan Pérez");
      formData.append("tipoOperacion", "TIPO_INVALIDO");
      formData.append("fechaInicio", "2026-01-15");
      formData.append("precioVentaTotal", "18000");
      formData.append("ingresosBrutos", "3000");

      const req = new NextRequest("http://localhost/api/operations", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      // No debe haberse creado ningún registro en la BD
      const count = await db.operation.count();
      expect(count).toBe(0);
    });

    it("sin token de sesión devuelve 401 y no crea ningún registro en la BD", async () => {
      mockAuth.mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/operations", {
        method: "POST",
        body: new FormData(),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);

      const count = await db.operation.count();
      expect(count).toBe(0);
    });
  });

  // ─── GET /api/operations ─────────────────────────────────────────────────────

  describe("GET /api/operations", () => {
    it("devuelve solo las operaciones del clienteId del usuario autenticado (no las de otro cliente)", async () => {
      const clienteA = await seedCliente({ nombre: "Cliente A" });
      const clienteB = await seedCliente({ nombre: "Cliente B" });

      // Sembrar una operación para cada cliente
      await seedOperacion({ clienteId: clienteA.id });
      await seedOperacion({ clienteId: clienteB.id });

      // Autenticar como clienteA
      mockAuth.mockResolvedValueOnce(makeSession(clienteA.id));

      const req = new NextRequest("http://localhost/api/operations");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.operations).toBeDefined();
      expect(body.operations).toHaveLength(1);

      // La operación devuelta debe pertenecer al clienteA en la BD
      const opEnBD = await db.operation.findFirst({
        where: { idOperacion: body.operations[0].idOperacion },
      });
      expect(opEnBD?.clienteId).toBe(clienteA.id);
    });
  });

  // ─── PATCH /api/operations/[id] ──────────────────────────────────────────────

  describe("PATCH /api/operations/[id]", () => {
    it("al cambiar precioVentaTotal recalcula ingresosNetos y comision en la BD con los valores correctos", async () => {
      const cliente = await seedCliente();
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-TEST-RECALC",
        precioVentaTotal: 10000,
        ingresosBrutos: 2000,
        ingresosNetos: 2000,
        comision: 20,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-TEST-RECALC",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ precioVentaTotal: 20000 }),
        }
      );

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "OP-TEST-RECALC" }),
      });
      expect(res.status).toBe(200);

      // Verificar en la BD los valores recalculados
      const updated = await db.operation.findUnique({ where: { id: op.id } });
      expect(updated).not.toBeNull();
      // ingresosNetos = ingresosBrutos - gastosAsociados = 2000 - 0 = 2000
      expect(updated!.ingresosNetos).toBe(2000);
      // comision = (ingresosNetos / precioVentaTotal) * 100 = (2000 / 20000) * 100 = 10
      expect(updated!.comision).toBe(10);
      // precioVentaTotal actualizado
      expect(updated!.precioVentaTotal).toBe(20000);
    });

    it("con id de operación de otro cliente devuelve 403 o 404 y la operación permanece intacta en la BD", async () => {
      const clienteA = await seedCliente({ nombre: "Cliente A" });
      const clienteB = await seedCliente({ nombre: "Cliente B" });

      await seedOperacion({
        clienteId: clienteB.id,
        idOperacion: "OP-TEST-CLIENTE-B",
        precioVentaTotal: 10000,
      });

      // Autenticar como clienteA intentando modificar una op del clienteB
      mockAuth.mockResolvedValueOnce(makeSession(clienteA.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-TEST-CLIENTE-B",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ precioVentaTotal: 99999 }),
        }
      );

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "OP-TEST-CLIENTE-B" }),
      });
      expect([403, 404]).toContain(res.status);

      // La operación del clienteB permanece intacta (no fue modificada)
      const op = await db.operation.findFirst({
        where: { idOperacion: "OP-TEST-CLIENTE-B" },
      });
      expect(op?.precioVentaTotal).toBe(10000);
    });
  });
});
