import { vi, describe, it, expect } from "vitest";

vi.mock("next-auth/jwt", () => ({ getToken: vi.fn() }));
vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: { next: vi.fn(), redirect: vi.fn() },
}));

import {
  isPublicPath,
  extractClienteIdFromPath,
  buildLoginUrl,
} from "@/middleware";

describe("isPublicPath", () => {
  it("retorna true para una ruta pública conocida (/login)", () => {
    expect(isPublicPath("/login")).toBe(true);
  });

  it("retorna false para una ruta privada (/dashboard)", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
  });

  it("retorna false con string vacío sin lanzar error", () => {
    expect(() => isPublicPath("")).not.toThrow();
    expect(isPublicPath("")).toBe(false);
  });
});

describe("extractClienteIdFromPath", () => {
  it("extrae el clienteId de una ruta /cliente/[id]/...", () => {
    expect(extractClienteIdFromPath("/cliente/42/operaciones")).toBe("42");
  });

  it("retorna null para una ruta que no contiene clienteId", () => {
    expect(extractClienteIdFromPath("/dashboard")).toBeNull();
  });
});

describe("buildLoginUrl", () => {
  const ORIGIN = "http://localhost:3000";

  it("construye la URL de login sin parámetro expired cuando expired es false", () => {
    const url = buildLoginUrl(ORIGIN, false);
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.has("expired")).toBe(false);
  });

  it("construye la URL de login con parámetro expired cuando expired es true", () => {
    const url = buildLoginUrl(ORIGIN, true);
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("expired")).toBe("1");
  });
});
