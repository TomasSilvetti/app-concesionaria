import { AppLayout } from "@/components/layout/AppLayout";

export default function DashboardAdminPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-zinc-900">
          Dashboard Administrador
        </h1>
        <p className="text-lg text-zinc-600">
          Panel de gestión global de clientes y operaciones
        </p>
      </div>
    </AppLayout>
  );
}
