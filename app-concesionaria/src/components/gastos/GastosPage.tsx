"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import "material-symbols/outlined.css";
import { GastosCharts } from "./GastosCharts";
import { GastosTabla } from "./GastosTabla";

interface Metricas {
  totalVendidoBruto: number;
  totalGastado: number;
  ganancia: number;
  margenPorcentaje?: number;
  plataPorCobrar: number;
}

function formatPesos(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDefaultPeriod() {
  const lastMonth = subMonths(new Date(), 1);
  return {
    desde: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
    hasta: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
  };
}

export function GastosPage() {
  const defaultPeriod = getDefaultPeriod();
  const [desde, setDesde] = useState(defaultPeriod.desde);
  const [hasta, setHasta] = useState(defaultPeriod.hasta);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetricas = useCallback(async (d: string, h: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/gastos/metricas?desde=${d}&hasta=${h}`);
      if (!res.ok) throw new Error("Error al cargar las métricas");
      const data = await res.json();
      setMetricas(data);
    } catch {
      setError("No se pudieron cargar las métricas de gastos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetricas(desde, hasta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMetricas]);

  const handleActualizar = () => {
    fetchMetricas(desde, hasta);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              receipt_long
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Gastos Operativos
            </h1>
            <p className="text-sm text-zinc-500">
              Gestión detallada de egresos y rentabilidad de inventario.
            </p>
          </div>
        </div>

        {/* Selector de período */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gastos-desde"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Desde
            </label>
            <input
              id="gastos-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Fecha desde"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="gastos-hasta"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Hasta
            </label>
            <input
              id="gastos-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Fecha hasta"
            />
          </div>
          <button
            type="button"
            onClick={handleActualizar}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="material-symbols-outlined text-xl">filter_list</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      {error ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">
            error
          </span>
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total vendido bruto"
            value={metricas?.totalVendidoBruto ?? null}
            loading={loading}
            icon="label"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <MetricCard
            label="Total gastado"
            value={metricas?.totalGastado ?? null}
            loading={loading}
            icon="receipt"
            iconBg="bg-red-100"
            iconColor="text-red-500"
          />
          <MetricCard
            label="Ganancia Neta"
            value={metricas?.ganancia ?? null}
            loading={loading}
            icon="trending_up"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            highlight
            badge={
              metricas?.margenPorcentaje != null
                ? `Margen ${metricas.margenPorcentaje}%`
                : undefined
            }
          />
          <MetricCard
            label="Plata por cobrar (Open)"
            value={metricas?.plataPorCobrar ?? null}
            loading={loading}
            icon="pending_actions"
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
        </div>
      )}

      {/* Gráficos */}
      <GastosCharts desde={desde} hasta={hasta} />

      {/* Tabla de gastos */}
      <GastosTabla desde={desde} hasta={hasta} />
    </div>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | null;
  loading: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
  badge?: string;
}

function MetricCard({
  label,
  value,
  loading,
  icon,
  iconBg,
  iconColor,
  highlight,
  badge,
}: MetricCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm ${
        highlight ? "border-l-4 border-blue-500" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <span className={`material-symbols-outlined text-xl ${iconColor}`}>
            {icon}
          </span>
        </div>
        {badge && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        {loading ? (
          <div
            className="mt-1.5 h-8 w-36 animate-pulse rounded-lg bg-zinc-200"
            aria-label="Cargando"
          />
        ) : (
          <p
            className={`text-2xl font-bold ${
              highlight ? "text-blue-600" : "text-zinc-900"
            }`}
          >
            {value != null ? formatPesos(value) : "$—"}
          </p>
        )}
      </div>
    </div>
  );
}
