import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const LOGIN_PATH = "/login";
const SESSION_EXPIRED_PARAM = "expired";

/** Rutas que no requieren autenticación */
const PUBLIC_PATHS = [LOGIN_PATH];

/** Patrón para extraer clienteId de rutas /cliente/[id]/... */
const CLIENTE_ROUTE_REGEX = /^\/cliente\/([^/]+)/;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return (
    cookieHeader.includes("authjs.session-token") ||
    cookieHeader.includes("__Secure-authjs.session-token")
  );
}

export function extractClienteIdFromPath(pathname: string): string | null {
  const match = pathname.match(CLIENTE_ROUTE_REGEX);
  return match ? match[1] : null;
}

export function buildLoginUrl(origin: string, expired: boolean): URL {
  const url = new URL(LOGIN_PATH, origin);
  if (expired) {
    url.searchParams.set(SESSION_EXPIRED_PARAM, "1");
  }
  return url;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const secureCookie = request.nextUrl.protocol === "https:";
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
  });

  if (!token) {
    const expired = hasSessionCookie(request);
    const loginUrl = buildLoginUrl(request.nextUrl.origin, expired);
    return NextResponse.redirect(loginUrl);
  }

  const rol = token.rol as string | undefined;
  const clienteId = token.clienteId as string | null | undefined;

  if (rol === "admin") {
    return NextResponse.next();
  }

  const routeClienteId = extractClienteIdFromPath(pathname);
  if (!routeClienteId) {
    return NextResponse.next();
  }

  if (rol === "usuario" && clienteId && routeClienteId !== clienteId) {
    const redirectUrl = new URL(
      `/cliente/${clienteId}/dashboard`,
      request.nextUrl.origin
    );
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluye: /api/*, _next/static, _next/image, favicon, assets estáticos
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
