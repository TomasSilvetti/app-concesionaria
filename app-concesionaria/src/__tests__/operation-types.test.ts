import { describe, it, expect } from "vitest";
import {
  isValidOperationTypeName,
  getOperationTypeByName,
} from "@/lib/operation-types";

describe("isValidOperationTypeName", () => {
  it("retorna true para un nombre de tipo de operación válido", () => {
    expect(isValidOperationTypeName("Venta 0km")).toBe(true);
  });

  it("retorna false cuando se pasa el id en lugar del nombre", () => {
    expect(isValidOperationTypeName("venta-0km")).toBe(false);
  });

  it("retorna false cuando se pasa un número en lugar del nombre", () => {
    expect(isValidOperationTypeName(1 as unknown as string)).toBe(false);
  });

  it("retorna false con string vacío", () => {
    expect(isValidOperationTypeName("")).toBe(false);
  });
});

describe("getOperationTypeByName", () => {
  it("retorna el objeto correcto para un nombre existente", () => {
    expect(getOperationTypeByName("Venta 0km")).toEqual({
      id: "venta-0km",
      nombre: "Venta 0km",
    });
  });

  it("retorna undefined sin lanzar error para un nombre inexistente", () => {
    expect(() => getOperationTypeByName("TipoQueNoExiste")).not.toThrow();
    expect(getOperationTypeByName("TipoQueNoExiste")).toBeUndefined();
  });
});
