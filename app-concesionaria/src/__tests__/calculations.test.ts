import { describe, it, expect } from "vitest";
import {
  calcularIngresosNetos,
  calcularComision,
} from "@/lib/calculations";

describe("calcularIngresosNetos", () => {
  it("retorna precioVenta - gastos en caso normal", () => {
    expect(calcularIngresosNetos(100000, 20000)).toBe(80000);
  });

  it("retorna el precio de venta sin cambios cuando no hay gastos", () => {
    expect(calcularIngresosNetos(100000, 0)).toBe(100000);
  });

  it("retorna un número negativo cuando los gastos superan el precio de venta", () => {
    expect(calcularIngresosNetos(10000, 50000)).toBe(-40000);
  });
});

describe("calcularComision", () => {
  it("retorna el porcentaje correcto en caso normal", () => {
    expect(calcularComision(100000, 80000)).toBe(80);
  });

  it("retorna 0 sin lanzar error cuando el precio de venta es 0", () => {
    expect(calcularComision(0, 80000)).toBe(0);
  });

  it("maneja ingresos netos negativos sin lanzar error", () => {
    expect(calcularComision(100000, -10000)).toBe(-10);
  });
});
