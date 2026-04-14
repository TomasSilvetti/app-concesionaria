import { AppLayout } from "@/components/layout/AppLayout";
import { MetricasDashboard } from "@/components/metricas/MetricasDashboard";

export default function MetricasRoute() {
  return (
    <AppLayout>
      <MetricasDashboard />
    </AppLayout>
  );
}
