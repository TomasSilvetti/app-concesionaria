import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock de auth ANTES de importar los route handlers
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { POST } from "@/app/api/operations/[id]/expenses/route";
import { DELETE } from "@/app/api/operations/[id]/expenses/[gastoId]/route";
import { db } from "./helpers/db";
import {
  seedCliente,
  seedOperacion,
  seedCategory,
  seedOrigin,
} from "./helpers/seed";

const mockAuth = vi.mocked(auth);

function makeSession(clienteId: string) {
  return {
    user: { id: "test-user-id", clienteId, rol: "usuario" },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

describe("Suite de integración: Gastos asociados", () => {
  // ─── Limpieza antes de cada test en orden que respeta foreign keys ───────────
  beforeEach(async () => {
    await db.expense.deleteMany({});
    await db.pago.deleteMany({});
    await db.operationExchange.deleteMany({});
    await db.operationDocument.deleteMany({});
    await db.operation.deleteMany({});
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

  // ─── POST /api/operations/[id]/expenses ──────────────────────────────────────

  describe("POST /api/operations/[id]/expenses", () => {
    it("con datos válidos devuelve 201 y gastosAsociados de la operación aumenta en el monto del gasto", async () => {
      const cliente = await seedCliente();
      const categoria = await seedCategory({ clienteId: cliente.id });
      const origen = await seedOrigin({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GASTOS-001",
        ingresosBrutos: 10000,
        ingresosNetos: 10000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-GASTOS-001/expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: "Gasto de prueba",
            monto: 500,
            origenId: origen.id,
            categoriaId: categoria.id,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-GASTOS-001" }),
      });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.gasto).toBeDefined();
      expect(body.gasto.id).toBeDefined();
      expect(body.gasto.monto).toBe(500);

      // Verificar que gastosAsociados se incrementó en BD
      const opActualizada = await db.operation.findUnique({
        where: { id: op.id },
      });
      expect(opActualizada?.gastosAsociados).toBe(500);
    });

    it("con datos válidos ingresosNetos de la operación disminuye en el monto del gasto", async () => {
      const cliente = await seedCliente();
      const categoria = await seedCategory({ clienteId: cliente.id });
      const origen = await seedOrigin({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GASTOS-NETOS",
        ingresosBrutos: 10000,
        ingresosNetos: 10000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-GASTOS-NETOS/expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: "Gasto neto test",
            monto: 300,
            origenId: origen.id,
            categoriaId: categoria.id,
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-GASTOS-NETOS" }),
      });

      expect(res.status).toBe(201);

      // ingresosNetos = ingresosBrutos - gastosAsociados = 10000 - 300 = 9700
      const opActualizada = await db.operation.findUnique({
        where: { id: op.id },
      });
      expect(opActualizada?.ingresosNetos).toBe(op.ingresosBrutos - 300);
    });

    it("con categoriaId inexistente devuelve 400 y no modifica la operación", async () => {
      const cliente = await seedCliente();
      const origen = await seedOrigin({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GASTOS-CATFAIL",
        ingresosBrutos: 10000,
        ingresosNetos: 10000,
      });

      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));

      const req = new NextRequest(
        "http://localhost/api/operations/OP-GASTOS-CATFAIL/expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: "Gasto con categoría inválida",
            monto: 200,
            origenId: origen.id,
            categoriaId: "categoria-inexistente-id",
          }),
        }
      );

      const res = await POST(req, {
        params: Promise.resolve({ id: "OP-GASTOS-CATFAIL" }),
      });

      expect([400, 404]).toContain(res.status);

      // La operación no debe haber sido modificada
      const opNoModificada = await db.operation.findUnique({
        where: { id: op.id },
      });
      expect(opNoModificada?.gastosAsociados).toBe(0);
      expect(opNoModificada?.ingresosNetos).toBe(op.ingresosNetos);
    });
  });

  // ─── DELETE /api/operations/[id]/expenses/[gastoId] ──────────────────────────

  describe("DELETE /api/operations/[id]/expenses/[gastoId]", () => {
    it("elimina el registro Expense y revierte gastosAsociados e ingresosNetos a los valores previos", async () => {
      const cliente = await seedCliente();
      const categoria = await seedCategory({ clienteId: cliente.id });
      const origen = await seedOrigin({ clienteId: cliente.id });
      const op = await seedOperacion({
        clienteId: cliente.id,
        idOperacion: "OP-GASTOS-DEL",
        ingresosBrutos: 10000,
        ingresosNetos: 10000,
      });

      // Crear el gasto vía POST
      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));
      const postReq = new NextRequest(
        "http://localhost/api/operations/OP-GASTOS-DEL/expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: "Gasto a eliminar",
            monto: 800,
            origenId: origen.id,
            categoriaId: categoria.id,
          }),
        }
      );
      const postRes = await POST(postReq, {
        params: Promise.resolve({ id: "OP-GASTOS-DEL" }),
      });
      expect(postRes.status).toBe(201);
      const { gasto } = await postRes.json();
      const gastoId: string = gasto.id;

      // Verificar que la operación refleja el gasto antes del DELETE
      const opConGasto = await db.operation.findUnique({ where: { id: op.id } });
      expect(opConGasto?.gastosAsociados).toBe(800);

      // Eliminar el gasto
      mockAuth.mockResolvedValueOnce(makeSession(cliente.id));
      const deleteReq = new NextRequest(
        `http://localhost/api/operations/OP-GASTOS-DEL/expenses/${gastoId}`,
        { method: "DELETE" }
      );
      const deleteRes = await DELETE(deleteReq, {
        params: Promise.resolve({ id: "OP-GASTOS-DEL", gastoId }),
      });

      expect(deleteRes.status).toBe(200);

      // El gasto ya no existe en BD
      const gastoEliminado = await db.expense.findUnique({
        where: { id: gastoId },
      });
      expect(gastoEliminado).toBeNull();

      // gastosAsociados e ingresosNetos volvieron a los valores previos al gasto
      const opRevertida = await db.operation.findUnique({ where: { id: op.id } });
      expect(opRevertida?.gastosAsociados).toBe(0);
      expect(opRevertida?.ingresosNetos).toBe(op.ingresosBrutos);
    });

    it("con gastoId que no pertenece al cliente autenticado devuelve 403 o 404 y el gasto permanece intacto", async () => {
      const clienteA = await seedCliente({ nombre: "Cliente A" });
      const clienteB = await seedCliente({ nombre: "Cliente B" });
      const categoria = await seedCategory({ clienteId: clienteA.id });
      const origen = await seedOrigin({ clienteId: clienteA.id });

      await seedOperacion({
        clienteId: clienteA.id,
        idOperacion: "OP-GASTOS-PERM",
        ingresosBrutos: 10000,
        ingresosNetos: 10000,
      });

      // Crear gasto como clienteA
      mockAuth.mockResolvedValueOnce(makeSession(clienteA.id));
      const postReq = new NextRequest(
        "http://localhost/api/operations/OP-GASTOS-PERM/expenses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            descripcion: "Gasto de clienteA",
            monto: 400,
            origenId: origen.id,
            categoriaId: categoria.id,
          }),
        }
      );
      const postRes = await POST(postReq, {
        params: Promise.resolve({ id: "OP-GASTOS-PERM" }),
      });
      expect(postRes.status).toBe(201);
      const { gasto } = await postRes.json();

      // Intentar eliminar el gasto autenticado como clienteB
      mockAuth.mockResolvedValueOnce(makeSession(clienteB.id));
      const deleteReq = new NextRequest(
        `http://localhost/api/operations/OP-GASTOS-PERM/expenses/${gasto.id}`,
        { method: "DELETE" }
      );
      const deleteRes = await DELETE(deleteReq, {
        params: Promise.resolve({ id: "OP-GASTOS-PERM", gastoId: gasto.id }),
      });

      expect([403, 404]).toContain(deleteRes.status);

      // El gasto debe seguir existiendo en BD
      const gastoIntacto = await db.expense.findUnique({
        where: { id: gasto.id },
      });
      expect(gastoIntacto).not.toBeNull();
    });
  });
});
