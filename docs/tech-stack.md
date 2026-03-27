# Tech Stack

- **Framework:** Next.js 16 (App Router) — rutas en `src/app/`, APIs en `src/app/api/`
- **ORM:** Prisma 5 — schema en `prisma/schema.prisma`, cliente en `@prisma/client`
- **Auth:** NextAuth v5 (`next-auth`) con Prisma Adapter
- **UI:** Tailwind CSS v4 + MUI v7 + `lucide-react` para iconos
- **Gráficos:** Recharts
- **PDF:** jsPDF + jspdf-autotable
- **Toasts:** Sonner
- **Runtime:** React 19, TypeScript 5
- **DB seed:** `npm run db:seed` (tsx prisma/seed.ts)
- **Dev server:** `npm run dev` → http://localhost:3000