# Pendientes a Futuro: Seguridad y Observabilidad

Este documento registra mejoras técnicas que deben implementarse antes de pasar a producción, detectadas durante el desarrollo de las porciones de la HU-3 (Sistema de Autenticación).

---

## 🔒 Seguridad

### 1. Rate Limiting en endpoints de autenticación

**Contexto:** Detectado durante el desarrollo de la porción-002 (Configuración de NextAuth).

**Problema:** Los endpoints de autenticación (`/api/auth/callback/credentials`) no tienen protección contra ataques de fuerza bruta. Un atacante podría intentar miles de combinaciones de username/password sin restricción.

**Impacto:** Alto riesgo de seguridad. Permite ataques automatizados para descubrir credenciales.

**Solución propuesta:**

Implementar rate limiting en los endpoints críticos:
- `/api/auth/callback/credentials` (login)
- `/api/auth/signup` (registro, si se implementa)
- `/api/auth/forgot-password` (recuperación de contraseña, si se implementa)

**Opciones de implementación:**

1. **Middleware de Next.js con Redis:**
   ```typescript
   // middleware.ts
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 intentos cada 15 minutos
   });
   ```

2. **next-rate-limit (sin Redis):**
   ```bash
   npm install next-rate-limit
   ```
   Configurar en el handler de `/api/auth/[...nextauth]/route.ts`

3. **Vercel Edge Config** (si se hostea en Vercel)

**Configuración recomendada:**
- Login: máximo 5 intentos cada 15 minutos por IP
- Registro: máximo 3 cuentas cada hora por IP
- Recuperación de contraseña: máximo 3 intentos cada hora por email

**Prioridad:** 🔴 Alta — Implementar antes de producción

**Afecta también a:**
- `/api/operations` (HU-2, porcion-002) — endpoint protegido por autenticación

---

## 📊 Observabilidad

### 2. Sistema de logging estructurado

**Contexto:** Detectado durante el desarrollo de la porción-002 (Configuración de NextAuth).

**Problema:** El proyecto no tiene un sistema de logging configurado. Actualmente se usa `console.log` y `console.error`, que no son adecuados para producción porque:
- No tienen niveles de severidad estructurados
- No incluyen contexto (timestamp, request ID, usuario)
- No se pueden filtrar o buscar eficientemente
- No se persisten en archivos o servicios externos

**Impacto:** Dificulta el debugging en producción, no hay trazabilidad de eventos críticos, imposible hacer auditoría de seguridad.

**Solución propuesta:**

Implementar una librería de logging profesional con niveles estructurados.

**Opciones de implementación:**

1. **Pino (recomendado para Next.js):**
   ```bash
   npm install pino pino-pretty
   ```
   
   ```typescript
   // src/lib/logger.ts
   import pino from "pino";
   
   export const logger = pino({
     level: process.env.LOG_LEVEL || "info",
     transport: {
       target: "pino-pretty",
       options: {
         colorize: true,
       },
     },
   });
   ```

2. **Winston:**
   ```bash
   npm install winston
   ```

**Eventos que deben loguearse:**

- **Nivel `info`:**
  - Usuario inició sesión exitosamente (incluir username, rol, timestamp)
  - Usuario cerró sesión
  - Usuario creado por administrador
  - Usuario activado/desactivado

- **Nivel `warn`:**
  - Intento de login con credenciales incorrectas (incluir username intentado, IP)
  - Intento de acceso con usuario inactivo (incluir username, IP)
  - Rate limit alcanzado (incluir IP, endpoint)

- **Nivel `error`:**
  - Error de conexión a base de datos
  - Error inesperado en callbacks de NextAuth
  - Fallo en generación de JWT

**Datos que NUNCA deben loguearse:**
- ❌ Contraseñas (ni siquiera hasheadas)
- ❌ Tokens JWT completos
- ❌ Datos de tarjetas de crédito
- ❌ Request/response bodies completos en producción

**Integración con servicios externos (opcional):**
- Sentry (para errores)
- Datadog (para logs y métricas)
- LogRocket (para sesiones de usuario)

**Prioridad:** 🟡 Media — Implementar antes de producción, pero no bloquea desarrollo

**Endpoints que actualmente usan console.error:**
- `/api/auth/[...nextauth]` (HU-3)
- `/api/users` (HU-3)
- `/api/clients` (HU-3)
- `/api/operations` (HU-2, porcion-002)

---

## 📋 Checklist de implementación

Antes de pasar a producción, verificar que estos puntos estén resueltos:

- [ ] Rate limiting implementado en endpoints de autenticación
- [ ] Sistema de logging estructurado configurado
- [ ] Logs de eventos de autenticación (login, logout, fallos)
- [ ] Logs de seguridad (intentos fallidos, usuarios inactivos)
- [ ] Monitoreo de rate limit alcanzado
- [ ] Integración con servicio de logs externo (opcional pero recomendado)

---

**Fecha de creación:** 2026-03-12  
**Relacionado con:** HU-3 (Sistema de Autenticación), porcion-002 (Configuración de NextAuth)
