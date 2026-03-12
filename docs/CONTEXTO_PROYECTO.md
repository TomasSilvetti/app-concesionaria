# Contexto del Proyecto Nordem

## 1. Descripción del Proyecto

**Nordem** es una aplicación web para la gestión integral de operaciones de compra-venta de vehículos. Permite administrar:

- **Operaciones**: Ventas de vehículos con seguimiento completo (fechas, precios, comisiones, gastos)
- **Stock**: Inventario de vehículos disponibles con detalles técnicos
- **Intercambios**: Sistema de toma de vehículos usados en operaciones de venta
- **Gastos**: Registro y categorización de gastos asociados a operaciones
- **Clientes multi-tenant**: Cada cliente tiene sus propios datos aislados
- **Usuarios**: Sistema de autenticación y roles por cliente

---

## 2. Stack Tecnológico

### Frontend y Backend
- **Next.js 16.1.6** (App Router)
- **React 19.2.3**
- **TypeScript 5**
- **Tailwind CSS 4**

### Base de Datos
- **PostgreSQL** (con Docker para desarrollo local)
- **Prisma 5.22.0** (ORM) - Versión estable recomendada
- **Prisma Accelerate** (solo para producción, opcional)

### UI Components
- **shadcn/ui** (componentes base)
- **Radix UI** (primitivos)
- **Lucide React** (iconos)
- **Recharts** (gráficos)

### Validación y Formularios
- **Zod 4.3.6** (validación de schemas)
- **React Hook Form 7.71.2** (manejo de formularios)

### Testing (opcional)
- **Vitest 4.0.18** (framework de testing)
- **vitest-mock-extended** (mocks de Prisma)

### Autenticación
- **NextAuth.js 5.0.0-beta.30**
- **bcrypt** (hashing de contraseñas)

### Utilidades
- **date-fns** (manejo de fechas)
- **jspdf + jspdf-autotable** (generación de PDFs)
- **xlsx** (exportación a Excel)
- **sonner** (notificaciones toast)

---

## 3. Estructura de Directorios

```
nordem/
├── .cursor/                    # Configuración de Cursor IDE
├── .github/                    # GitHub workflows y configuración
├── docs/                       # Documentación del proyecto
│   └── porciones/             # Documentación de porciones de HU
├── historias-usuario/          # Historias de usuario
├── prisma/
│   ├── migrations/            # Migraciones de base de datos
│   └── schema.prisma          # Schema de la base de datos
├── public/                     # Archivos estáticos
├── scripts/                    # Scripts de utilidad
├── src/
│   ├── actions/               # Server Actions de Next.js
│   │   ├── operation/         # Acciones de operaciones
│   │   ├── operationType/     # Acciones de tipos de operación
│   │   ├── shared/            # Acciones compartidas (validaciones FK)
│   │   ├── vehicleBrand/      # Acciones de marcas
│   │   └── vehicleCategory/   # Acciones de categorías
│   ├── app/                   # App Router de Next.js
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Páginas del dashboard
│   │   ├── operations/        # Páginas de operaciones
│   │   └── test/              # Páginas de testing
│   ├── components/            # Componentes React
│   │   ├── dashboard/         # Componentes del dashboard
│   │   ├── layout/            # Componentes de layout
│   │   ├── operations/        # Componentes de operaciones
│   │   └── ui/                # Componentes UI base (shadcn)
│   ├── lib/                   # Librerías y utilidades
│   │   ├── calculations/      # Cálculos de negocio
│   │   ├── operations/        # Lógica de operaciones
│   │   └── validations/       # Validaciones de negocio
│   ├── schemas/               # Schemas de Zod
│   └── types/                 # Tipos de TypeScript
├── tests/                     # Tests (eliminados, pero estructura de referencia)
│   ├── unit/                  # Tests unitarios
│   └── integration/           # Tests de integración
├── .env                       # Variables de entorno (no commitear)
├── .env.example               # Ejemplo de variables de entorno
├── package.json               # Dependencias del proyecto
├── tsconfig.json              # Configuración de TypeScript
├── tailwind.config.ts         # Configuración de Tailwind
├── vitest.config.ts           # Configuración de tests unitarios
└── vitest.integration.config.ts # Configuración de tests de integración
```

---

## 4. Schema de Base de Datos

### Configuración de Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

### Modelos de Base de Datos

#### Client (Clientes multi-tenant)
```prisma
model Client {
  id                 String            @id @default(cuid())
  nombre             String
  activo             Boolean           @default(true)
  modulos            Json
  creadoEn           DateTime          @default(now())
  actualizadoEn      DateTime          @updatedAt
  categorias         Category[]
  gastos             Expense[]
  operaciones        Operation[]
  tiposOperacion     OperationType[]
  origenes           Origin[]
  usuarios           User[]
  marcasVehiculo     VehicleBrand[]
  categoriasVehiculo VehicleCategory[]
}
```

#### User (Usuarios del sistema)
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  nombre        String?
  password      String
  rol           String   @default("user")
  clienteId     String
  activo        Boolean  @default(true)
  creadoEn      DateTime @default(now())
  actualizadoEn DateTime @updatedAt
  cliente       Client   @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@index([clienteId])
}
```

#### Operation (Operaciones de venta)
```prisma
model Operation {
  id                      String              @id @default(cuid())
  idOperacion             String
  clienteId               String
  fechaInicio             DateTime
  fechaVenta              DateTime?
  modelo                  String
  anio                    Int
  patente                 String
  precioVentaTotal        Float
  ingresosBrutos          Float
  comision                Float
  gastosAsociados         Float               @default(0)
  ingresosNetos           Float
  estado                  String              @default("open")
  creadoEn                DateTime            @default(now())
  actualizadoEn           DateTime            @updatedAt
  marcaId                 String
  categoriaId             String
  tipoOperacionId         String
  diasVenta               Int?
  gastos                  Expense[]
  marca                   VehicleBrand        @relation(fields: [marcaId], references: [id])
  categoria               VehicleCategory     @relation(fields: [categoriaId], references: [id])
  cliente                 Client              @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  tipoOperacion           OperationType       @relation(fields: [tipoOperacionId], references: [id])
  stock                   Stock?
  vehiculosIntercambiados OperationExchange[]

  @@unique([clienteId, idOperacion])
  @@index([clienteId])
  @@index([estado])
  @@index([marcaId])
  @@index([categoriaId])
  @@index([tipoOperacionId])
}
```

#### Stock (Inventario de vehículos)
```prisma
model Stock {
  id                      String              @id @default(cuid())
  operacionId             String              @unique
  clienteId               String
  version                 String?
  color                   String?
  kilometros              Int?
  tipoIngreso             String
  notasMecanicas          String?
  notasGenerales          String?
  precioRevista           Float?
  precioOferta            Float?
  creadoEn                DateTime            @default(now())
  actualizadoEn           DateTime            @updatedAt
  operacion               Operation           @relation(fields: [operacionId], references: [id], onDelete: Cascade)
  intercambiosOperaciones OperationExchange[]

  @@index([clienteId])
}
```

#### OperationExchange (Tabla intermedia para intercambios)
```prisma
model OperationExchange {
  id              String    @id @default(cuid())
  operacionId     String
  stockId         String
  precioNegociado Float?
  creadoEn        DateTime  @default(now())
  actualizadoEn   DateTime  @updatedAt

  operacion Operation @relation(fields: [operacionId], references: [id], onDelete: Cascade)
  stock     Stock     @relation(fields: [stockId], references: [id])

  @@unique([operacionId, stockId])
  @@index([operacionId])
  @@index([stockId])
}
```
**Propósito**: Permite asociar múltiples vehículos de intercambio (usados) a una operación de venta. Cada intercambio puede tener un `precioNegociado` específico diferente al `precioOferta` del stock.

#### Expense (Gastos)
```prisma
model Expense {
  id            String     @id @default(cuid())
  clienteId     String
  operacionId   String?
  fecha         DateTime
  descripcion   String
  categoriaId   String
  tipo          String
  monto         Float
  estado        String
  origenId      String
  creadoEn      DateTime   @default(now())
  actualizadoEn DateTime   @updatedAt
  categoria     Category   @relation(fields: [categoriaId], references: [id])
  cliente       Client     @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  operacion     Operation? @relation(fields: [operacionId], references: [id])
  origen        Origin     @relation(fields: [origenId], references: [id])

  @@index([clienteId])
  @@index([operacionId])
  @@index([categoriaId])
  @@index([origenId])
}
```

#### Category (Categorías de gastos)
```prisma
model Category {
  id        String    @id @default(cuid())
  clienteId String
  nombre    String
  creadoEn  DateTime  @default(now())
  cliente   Client    @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  gastos    Expense[]

  @@unique([clienteId, nombre])
  @@index([clienteId])
}
```

#### Origin (Orígenes de gastos)
```prisma
model Origin {
  id        String    @id @default(cuid())
  clienteId String
  nombre    String
  creadoEn  DateTime  @default(now())
  gastos    Expense[]
  cliente   Client    @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@unique([clienteId, nombre])
  @@index([clienteId])
}
```

#### VehicleBrand (Marcas de vehículos)
```prisma
model VehicleBrand {
  id            String      @id @default(cuid())
  clienteId     String
  nombre        String
  creadoEn      DateTime    @default(now())
  actualizadoEn DateTime    @updatedAt
  operaciones   Operation[]
  cliente       Client      @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@unique([clienteId, nombre])
  @@index([clienteId])
}
```

#### VehicleCategory (Categorías de vehículos)
```prisma
model VehicleCategory {
  id          String      @id @default(cuid())
  clienteId   String
  nombre      String
  creadoEn    DateTime    @default(now())
  operaciones Operation[]
  cliente     Client      @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@unique([clienteId, nombre])
  @@index([clienteId])
}
```

#### OperationType (Tipos de operación)
```prisma
model OperationType {
  id          String      @id @default(cuid())
  clienteId   String
  nombre      String
  creadoEn    DateTime    @default(now())
  operaciones Operation[]
  cliente     Client      @relation(fields: [clienteId], references: [id], onDelete: Cascade)

  @@unique([clienteId, nombre])
  @@index([clienteId])
}
```
**Ejemplos**: "Venta simple", "Venta con toma de usado", "Consignación"

---

## 5. Configuración de Entornos

### Desarrollo Local (Dev)
```env
# Base de datos local con Docker
DATABASE_URL="postgresql://usuario:password@localhost:5432/nordem_dev"
DIRECT_URL="postgresql://usuario:password@localhost:5432/nordem_dev"

# NextAuth
NEXTAUTH_SECRET="tu-secret-generado"
NEXTAUTH_URL="http://localhost:3000"
```

**Setup de Docker para PostgreSQL:**
```bash
docker run --name nordem-postgres \
  -e POSTGRES_USER=usuario \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nordem_dev \
  -p 5432:5432 \
  -d postgres:16
```

### Producción
```env
# Prisma Accelerate (connection pooling)
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=tu-api-key"

# Conexión directa para migraciones
DIRECT_URL="postgresql://usuario:password@host:5432/nordem_prod"

# NextAuth
NEXTAUTH_SECRET="tu-secret-produccion"
NEXTAUTH_URL="https://tu-dominio.com"
```

---

## 6. Guía de Instalación y Setup Inicial

### Paso 1: Crear proyecto Next.js

```bash
# Crear proyecto con TypeScript
npx create-next-app@latest nordem --typescript --tailwind --app --no-src-dir

cd nordem
```

### Paso 2: Instalar dependencias principales

```bash
# Dependencias de producción
npm install @prisma/client@5.22.0 next-auth@5.0.0-beta.30 @auth/prisma-adapter@2.11.1
npm install zod@4.3.6 react-hook-form@7.71.2 @hookform/resolvers@5.2.2
npm install bcrypt@6.0.0 @types/bcrypt@6.0.0
npm install date-fns@4.1.0 clsx@2.1.1 tailwind-merge@3.5.0
npm install lucide-react@0.577.0 sonner@2.0.7
npm install @radix-ui/react-label@2.1.8 @radix-ui/react-slot@1.2.4
npm install class-variance-authority@0.7.1
npm install recharts@3.8.0 jspdf@4.2.0 jspdf-autotable@5.0.7 xlsx@0.18.5

# Dependencias de desarrollo
npm install -D prisma@5.22.0 @prisma/adapter-pg@5.22.0
npm install -D typescript@5 @types/node@20 @types/react@19 @types/react-dom@19
npm install -D vitest@4.0.18 @vitest/ui@4.0.18 vitest-mock-extended@3.1.0
npm install -D pg@8.20.0 dotenv@17.3.1 cross-env@10.1.0
npm install -D eslint@9 eslint-config-next@16.1.6
```

### Paso 3: Configurar estructura de directorios

```bash
# Crear estructura src/
mkdir src
mkdir src\actions src\components src\lib src\schemas src\types

# Crear subdirectorios
mkdir src\actions\operation src\actions\operationType src\actions\shared
mkdir src\actions\vehicleBrand src\actions\vehicleCategory
mkdir src\components\dashboard src\components\layout src\components\operations src\components\ui
mkdir src\lib\calculations src\lib\operations src\lib\validations

# Mover app/ a src/
# (Next.js ya crea app/ en la raíz, moverla a src/)
```

### Paso 4: Configurar base de datos local con Docker

```bash
# Iniciar PostgreSQL con Docker Desktop
docker run --name nordem-postgres `
  -e POSTGRES_USER=nordem_user `
  -e POSTGRES_PASSWORD=nordem_pass `
  -e POSTGRES_DB=nordem_dev `
  -p 5432:5432 `
  -d postgres:16

# Verificar que está corriendo
docker ps
```

### Paso 5: Configurar Prisma

```bash
# Inicializar Prisma
npx prisma init

# Copiar el schema.prisma completo (ver sección 4 de este documento)
# Reemplazar el contenido de prisma/schema.prisma con el schema actualizado
```

### Paso 6: Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
# Base de datos local con Docker
DATABASE_URL="postgresql://nordem_user:nordem_pass@localhost:5432/nordem_dev"
DIRECT_URL="postgresql://nordem_user:nordem_pass@localhost:5432/nordem_dev"

# NextAuth
NEXTAUTH_SECRET="genera-un-secret-aleatorio-de-32-caracteres-minimo"
NEXTAUTH_URL="http://localhost:3000"
```

Para generar `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Paso 7: Ejecutar primera migración

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear y aplicar primera migración
npx prisma migrate dev --name init

# Verificar con Prisma Studio
npx prisma studio
```

### Paso 8: Configurar alias de TypeScript

Editar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Paso 9: Iniciar servidor de desarrollo

```bash
npm run dev
```

### Paso 10: Verificar instalación

- Abrir http://localhost:3000
- Verificar conexión a BD con `npx prisma studio` (http://localhost:5555)
- Verificar que el proyecto compila sin errores

---

## 7. Lecciones Aprendidas / Errores a Evitar

### ❌ Error 1: Usar Prisma Accelerate en desarrollo
**Problema**: Accelerate agrega latencia, complejidad y costos innecesarios en desarrollo local. Causó problemas con tests de integración.

**Solución**: 
- ✅ Dev: PostgreSQL local con Docker + conexión directa
- ✅ Producción: Accelerate para connection pooling

### ❌ Error 2: Campos de intercambio en tabla Operation
**Problema**: Los campos `hasExchange`, `exchangeModel`, `exchangePrice`, etc. solo permitían UN vehículo de intercambio por operación.

**Solución**: 
- ✅ Tabla intermedia `OperationExchange` para relación N:N
- ✅ Permite múltiples vehículos de intercambio por operación
- ✅ `precioNegociado` específico por cada intercambio

### ⚠️ Recomendación: Usar Prisma 5.22.0 en vez de Prisma 7

**Razón**: Prisma 7 (a marzo 2026) tiene bugs críticos activos:
- Problemas con transacciones en PostgreSQL
- Breaking changes grandes (migración a ES Modules obligatoria)
- Requiere configuración adicional con `prisma.config.ts`
- Errores con TypedSQL y pooling

**Solución**: Usar Prisma 5.22.0 que es estable, maduro y tiene amplia documentación.

---

## 8. Convenciones de Código

### Naming Conventions

#### Variables, funciones y campos de BD:
- ✅ **Español sin caracteres especiales**
- ✅ `camelCase` para variables y funciones
- ✅ `PascalCase` para componentes y tipos
- ❌ **NO usar ñ, tildes o caracteres especiales**

```typescript
// ✅ CORRECTO
const nombreCliente = "Juan Pérez";  // Variable sin tilde
const anioVehiculo = 2024;           // Sin ñ
const descripcionGasto = "Reparación";

// ❌ INCORRECTO
const nombreCliente = "Juan";        // Con tilde
const añoVehiculo = 2024;            // Con ñ
```

#### Strings de UI (textos visibles al usuario):
- ✅ **Español correcto con tildes y ñ**

```typescript
// ✅ CORRECTO
<label>Año de fabricación</label>
<h1>Descripción del vehículo</h1>
```

### Estructura de Componentes
- Componentes en `src/components/[modulo]/`
- Un componente por archivo
- Exportación nombrada preferida

### Server Actions
- Ubicación: `src/actions/[modulo]/`
- Nomenclatura: verbo + entidad (ej: `createOperation`, `getOperations`)
- Siempre usar `"use server"` al inicio
- Validar con Zod antes de operaciones de BD

### Validaciones
- Schemas Zod en `src/schemas/`
- Validaciones de negocio en `src/lib/validations/`
- Validaciones de FK en `src/actions/shared/validateForeignKeys.ts`

---

## 9. Flujo de Desarrollo Recomendado

### Para nuevas features:

1. **Planificación**: Analizar y descomponer la funcionalidad
2. **Schema**: Actualizar `schema.prisma` si es necesario
3. **Migraciones**: `npx prisma migrate dev --name descripcion_cambio`
4. **Server Actions**: Implementar lógica de negocio y acciones del servidor
5. **Validaciones**: Crear schemas de Zod y validaciones de negocio
6. **UI**: Desarrollar componentes y formularios
7. **Validación final**: Probar flujo completo en navegador

---

## 10. Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor de desarrollo
npx prisma studio             # Abrir Prisma Studio (GUI de BD)

# Base de datos
npx prisma generate           # Generar cliente de Prisma
npx prisma migrate dev        # Crear y aplicar migración
npx prisma migrate reset      # Resetear BD (¡cuidado!)
npx prisma db push            # Push schema sin crear migración
npx prisma format             # Formatear schema.prisma
npx prisma validate           # Validar schema.prisma

# Docker (PowerShell)
docker start nordem-postgres  # Iniciar contenedor existente
docker stop nordem-postgres   # Detener contenedor
docker logs nordem-postgres   # Ver logs de PostgreSQL
docker exec -it nordem-postgres psql -U nordem_user -d nordem_dev  # Conectar a psql
docker ps                     # Ver contenedores corriendo

# Build
npm run build                 # Build para producción
npm start                     # Iniciar servidor de producción
npm run lint                  # Ejecutar linter
```

---

## 11. Variables de Entorno Requeridas

```env
# Base de datos (desarrollo local)
DATABASE_URL="postgresql://nordem_user:nordem_pass@localhost:5432/nordem_dev"
DIRECT_URL="postgresql://nordem_user:nordem_pass@localhost:5432/nordem_dev"

# Base de datos (producción con Accelerate)
# DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=tu-api-key"
# DIRECT_URL="postgresql://usuario:password@host:5432/nordem_prod"

# NextAuth
NEXTAUTH_SECRET="secret-aleatorio-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# (Agregar otras variables según necesidad)
```

---

## 12. Modelo de Datos - Conceptos Clave

### Multi-tenancy
- Cada `Client` tiene sus propios datos aislados
- Todos los modelos tienen `clienteId` para filtrado
- Índices en `clienteId` para performance

### Operaciones
- Representan una venta de vehículo
- Tienen un vehículo principal (relación 1:1 con `Stock`)
- Pueden tener múltiples vehículos de intercambio (relación N:N vía `OperationExchange`)

### Sistema de Intercambios
- **Tabla intermedia**: `OperationExchange`
- **Relación**: Una operación puede tener múltiples autos de intercambio
- **Precio negociado**: Cada intercambio puede tener un precio específico diferente al precio de stock
- **Ejemplo**: 
  - Auto A en Stock tiene `precioOferta = $10,000`
  - Operación 1 toma Auto A con `precioNegociado = $9,500`
  - Operación 2 toma Auto A con `precioNegociado = $10,200`

### Gastos
- Pueden estar asociados a una operación específica o ser generales
- Tienen categoría y origen para clasificación
- Se usan para calcular `gastosAsociados` e `ingresosNetos` de operaciones

---

## 13. Patrones de Código

### Server Actions
```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function createEntity(data: unknown) {
  // 1. Validar con Zod
  const validated = schema.parse(data);
  
  // 2. Validar foreign keys si es necesario
  await validateForeignKeys(validated);
  
  // 3. Operación de BD
  const result = await prisma.entity.create({
    data: validated,
  });
  
  // 4. Revalidar cache
  revalidatePath("/ruta");
  
  return result;
}
```

### Componentes con Formularios
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@/schemas/entity";

export function EntityForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ... },
  });
  
  const onSubmit = async (data) => {
    const result = await createEntity(data);
    // Manejar resultado
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

---

## 14. Decisiones de Arquitectura

### ¿Por qué Server Actions en vez de API Routes?
- Mejor integración con React Server Components
- Menos boilerplate
- Type-safety automático
- Revalidación de cache más simple

### ¿Por qué Prisma?
- Type-safety completo
- Migraciones automáticas
- Excelente DX con Prisma Studio
- Buen soporte para PostgreSQL

### ¿Por qué Vitest en vez de Jest? (Si decides usar testing)
- Más rápido
- Mejor integración con TypeScript
- Configuración más simple
- Compatible con Vite/Next.js

### ¿Por qué PostgreSQL?
- Relaciones complejas (operaciones, stock, intercambios)
- Integridad referencial
- Transacciones ACID
- Excelente soporte con Prisma

---

## 15. Próximos Pasos Sugeridos

Al iniciar el proyecto desde cero:

1. **Setup inicial**:
   - Crear proyecto Next.js con TypeScript
   - Instalar todas las dependencias del `package.json`
   - Configurar Tailwind CSS 4

2. **Base de datos**:
   - Setup Docker con PostgreSQL
   - Configurar Prisma
   - Copiar `schema.prisma` actualizado
   - Ejecutar primera migración

3. **Autenticación**:
   - Configurar NextAuth.js
   - Crear modelo User y Client
   - Implementar login/logout

4. **Estructura base**:
   - Layout principal
   - Navegación
   - Componentes UI base (shadcn)

5. **Módulos principales** (en orden):
   - Gestión de marcas y categorías
   - Gestión de tipos de operación
   - Gestión de operaciones (CRUD completo)
   - Sistema de stock
   - Sistema de intercambios (OperationExchange)
   - Gestión de gastos
   - Dashboard y reportes

---

## 16. Recursos y Documentación

### Documentación oficial:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Vitest: https://vitest.dev

### Comandos de referencia rápida:
```bash
# Prisma
npx prisma studio              # GUI de BD
npx prisma format              # Formatear schema
npx prisma validate            # Validar schema

# Next.js
npm run dev                    # Desarrollo
npm run build                  # Build producción
npm run lint                   # Linter

# Testing
npm test                       # Todos los tests
npm run test:watch             # Watch mode
npm run test:coverage          # Cobertura
```

---

## 17. Notas Importantes

### Multi-tenancy
- **SIEMPRE** filtrar por `clienteId` en todas las queries
- Usar middleware o helpers para asegurar aislamiento
- Validar que el usuario tiene acceso al cliente correcto

### Seguridad
- Nunca exponer IDs internos en URLs públicas
- Validar permisos en Server Actions
- Sanitizar inputs del usuario
- Usar `onDelete: Cascade` con cuidado

### Performance
- Usar índices en campos de búsqueda frecuente
- Incluir solo relaciones necesarias en queries
- Considerar paginación para listas grandes
- Usar `revalidatePath` estratégicamente

### Testing
- Configurar según metodología elegida
- NO usar Accelerate en tests
- Si usas tests de integración, ejecutarlos en serie (no en paralelo)

---

## 18. Contacto y Mantenimiento

- **Proyecto**: Nordem - Sistema de gestión de operaciones vehiculares
- **Stack**: Next.js 16 + React 19 + Prisma 5.22.0 + PostgreSQL
- **Última actualización**: Marzo 2026
