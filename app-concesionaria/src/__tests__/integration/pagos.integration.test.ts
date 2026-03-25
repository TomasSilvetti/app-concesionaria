import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

// Mock de auth ANTES de importar los route handlers
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { GET, POST } from "@/app/api/operations/[id]/pagos/route";
import { db } from "./helpers/db";
import {
  seedCliente,
  seedOperacion,
  seedPaymentMethod,
} from "./helpers/seed";

const mockAuth = vi.mocked(auth);

function makeSession(clienteId: string) {
  return {
    user: { id: "test-user-id", clienteId, rol: "usuario" },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

describe("Suite de integración: Pagos", () => {
  // ─── Limpieza antes de cada test en orden que respeta foreign keys ───────────
  beforeEach(async () => {
    await db.pago.deleteMany({});
    await db.operationExchange.deleteMany({});
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

  // ─── POST /api/operations/[id]/pagos ─────────────────────────────────────────

  describe("POST /api/operations/[id]/pagos", () => {
    it("con datos válidos devuelve 201, body incluye id/monto/fecha y el pago queda en BD con el monto correcto", async () => {
      const cliente = await seedCliente();
      const metodoPago = await seedPaymentMethod({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-PAGOS-001",
        precioVentaTotal: 5000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-PAGOS-001/pagos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha: new Date().toISOString(),
            metodoPagoId: metodoPago.id,
            monto: 2000,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-PAGOS-001" }),
      });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.pago).toBeDefined();
      expect(body.pago.id).toBeDefined();
      expect(body.pago.monto).toBe(2000);
      expect(body.pago.fecha).toBeDefined();

      // Verificar que el pago quedó efectivamente en la BD
      const pagosEnBD = await db.pago.findMany({
        where: { operacionId: op.id },
      });
      expect(pagosEnBD).toHaveLength(1);
      expect(pagosEnBD[0].monto).toBe(2000);
    });

    it("con datos válidos el saldo pendiente de la operación refleja el descuento del pago registrado", async () => {
      const cliente = await seedCliente();
      const metodoPago = await seedPaymentMethod({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-PAGOS-SALDO",
        precioVentaTotal: 5000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-PAGOS-SALDO/pagos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha: new Date().toISOString(),
            metodoPagoId: metodoPago.id,
            monto: 2000,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-PAGOS-SALDO" }),
      });
      const body = await res.json();

      expect(res.status).toBe(201);

      // El saldo pendiente calculado = precioVentaTotal - monto pagado
      const pagosEnBD = await db.pago.findMany({
        where: { operacionId: op.id },
      });
      const saldado = pagosEnBD.reduce((sum, p) => sum + p.monto, 0);
      expect(op.precioVentaTotal - saldado).toBe(3000);

      // La respuesta también debe reflejar el pendiente correcto
      expect(body.saldado).toBe(2000);
      expect(body.pendiente).toBe(3000);
    });

    it("con monto negativo devuelve 400 y no crea ningún registro en BD", async () => {
      const cliente = await seedCliente();
      const metodoPago = await seedPaymentMethod({ clienteId: cliente.id });
      await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-PAGOS-NEG",
        precioVentaTotal: 5000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-PAGOS-NEG/pagos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha: new Date().toISOString(),
            metodoPagoId: metodoPago.id,
            monto: -500,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-PAGOS-NEG" }),
      });

      expect(res.status).toBe(400);

      // El conteo de pagos en BD debe seguir siendo 0
      const count = await db.pago.count();
      expect(count).toBe(0);
    });

    it("con operación que pertenece a otro cliente devuelve 403 o 404", async () => {
      const clienteA = await seedCliente({ nombre: "Cliente A" });
      const clienteB = await seedCliente({ nombre: "Cliente B" });
      const metodoPago = await seedPaymentMethod({ clienteId: clienteB.id });

      await seedOperacion({
        clienteId: clienteB.id,
        idOperacion: "OP-CLIENTE-B",
        precioVentaTotal: 10000,
      });

      // Autenticar como clienteA intentando pagar una op del clienteB
      mockAuth.mockResolvedValueOnce(makeSession(clienteA.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-CLIENTE-B/pagos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fecha: new Date().toISOString(),
            metodoPagoId: metodoPago.id,
            monto: 1000,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-CLIENTE-B" }),
      });

      expect([403, 404]).toContain(res.status);

      // No se debe haber creado ningún pago
      const count = await db.pago.count();
      expect(count).toBe(0);
    });
  });

  // ─── GET /api/operations/[id]/pagos ──────────────────────────────────────────

  describe("GET /api/operations/[id]/pagos", () => {
    it("devuelve solo los pagos de la operación solicitada (no los de otras operaciones)", async () => {
      const cliente = await seedCliente();
      const metodoPago = await seedPaymentMethod({ clienteId: cliente.id });

      const opA = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GET-A",
        precioVentaTotal: 10000,
      });
      const opB = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GET-B",
        precioVentaTotal: 10000,
      });

      // Sembrar un pago en cada operación directamente en BD
      await db.pago.create({
        data: {
          id: randomUUID(),
          operacionId: opA.id,
          clienteId: cliente.id,
          fecha: new Date(),
          metodoPagoId: metodoPago.id,
          monto: 1000,
          actualizadoEn: new Date(),
        },
      });
      await db.pago.create({
        data: {
          id: randomUUID(),
          operacionId: opB.id,
          clienteId: cliente.id,
          fecha: new Date(),
          metodoPagoId: metodoPago.id,
          monto: 2000,
          actualizadoEn: new Date(),
        },
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-GET-A/pagos"
      );
      const res = await GET(req, {
        params: Promise.resolve({ id: "OP-GET-A" }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      // Solo debe devolver el pago de opA, no el de opB
      expect(body.pagos).toHaveLength(1);
      expect(body.pagos[0].monto).toBe(1000);
    });
  });
});
