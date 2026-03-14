import { AppLayout } from "@/components/layout/AppLayout";

export default function ClientesPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-zinc-900">
          Clientes
        </h1>
        <p className="text-lg text-zinc-600">
          Gestión de clientes
        </p>
      </div>
    </AppLayout>
  );
}
