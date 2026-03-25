import { encode } from "next-auth/jwt";

const COOKIE_NAME = "authjs.session-token";

/**
 * Genera un token JWT cifrado (JWE) compatible con NextAuth v5.
 * El token resultante puede usarse como valor de la cookie `authjs.session-token`
 * en requests de test, y será decodificado correctamente por `getToken()` del middleware.
 *
 * Nota: NextAuth v5 usa JWE (5 segmentos separados por `.`), no JWT estándar (3 segmentos).
 *
 * @param userId    — id del usuario (campo `id` en la tabla User)
 * @param clienteId — id del cliente asociado, o null para usuarios admin sin cliente
 * @param rol       — rol del usuario ("admin" | "usuario")
 */
export async function generarTokenTest(
  userId: string,
  clienteId: string | null,
  rol: string
): Promise<string> {
  const secret =
    process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "test-secret";

  return encode({
    token: {
      sub: userId,
      id: userId,
      clienteId,
      rol,
    },
    secret,
    salt: COOKIE_NAME,
  });
}

/**
 * Devuelve el header Cookie listo para incluir en un fetch de test.
 * Ejemplo:
 *   const headers = await buildAuthCookieHeader(userId, clienteId, "usuario");
 *   fetch(url, { headers })
 */
export async function buildAuthCookieHeader(
  userId: string,
  clienteId: string | null,
  rol: string
): Promise<{ Cookie: string }> {
  const token = await generarTokenTest(userId, clienteId, rol);
  return { Cookie: `${COOKIE_NAME}=${token}` };
}
