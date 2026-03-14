import { AppLayout } from "@/components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-zinc-900">
          Bienvenido a Nordem
        </h1>
        <p className="text-lg text-zinc-600">
          Sistema de gestión integral de operaciones vehiculares
        </p>
      </div>
    </AppLayout>
  );
}
