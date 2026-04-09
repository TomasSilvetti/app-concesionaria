"use client";

import { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";

interface KpiData {
  gananciaNeta: number | null;
  gananciaDelta: number | null;
  ticketPromedio: number | null;
  tasaConversion: number | null;
  capitalStock: number | null;
  deudaPendiente: number | null;
}

interface KpiCardsProps {
  desde: string;
  hasta: string;
}

function formatPesos(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Mock data — reemplazar con fetch real cuando esté el endpoint
function fetchKpiData(_desde: string, _hasta: string): Promise<KpiData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        gananciaNeta: 2450000,
        gananciaDelta: 12.4,
        ticketPromedio: 8200000,
        tasaConversion: 34,
        capitalStock: 45000000,
        deudaPendiente: 3800000,
      });
    }, 800);
  });
}

export function KpiCards({ desde, hasta }: KpiCardsProps) {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchKpiData(desde, hasta);
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        role="alert"
      >
        <span className="material-symbols-outlined text-xl text-red-500">error</span>
        No se pudieron cargar los indicadores. Intentá de nuevo más tarde.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        label="Ganancia neta del mes"
        value={data?.gananciaNeta ?? null}
        format="pesos"
        loading={loading}
        icon="trending_up"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        highlight
        delta={data?.gananciaDelta ?? null}
      />
      <KpiCard
        label="Ticket promedio de venta"
        value={data?.ticketPromedio ?? null}
        format="pesos"
        loading={loading}
        icon="sell"
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      />
      <KpiCard
        label="Tasa de conversión"
        value={data?.tasaConversion ?? null}
        format="percent"
        loading={loading}
        icon="conversion_path"
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
      />
      <KpiCard
        label="Capital inmovilizado en stock"
        value={data?.capitalStock ?? null}
        format="pesos"
        loading={loading}
        icon="inventory_2"
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
      />
      <KpiCard
        label="Deuda total pendiente"
        value={data?.deudaPendiente ?? null}
        format="pesos"
        loading={loading}
        icon="pending_actions"
        iconBg="bg-red-100"
        iconColor="text-red-500"
      />
    </div>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | null;
  format: "pesos" | "percent";
  loading: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
  delta?: number | null;
}

function KpiCard({ label, value, format, loading, icon, iconBg, iconColor, highlight, delta }: KpiCardProps) {
  const displayValue =
    value == null
      ? "—"
      : format === "percent"
      ? `${value}%`
      : formatPesos(value);

  const deltaPositive = delta != null && delta > 0;
  const deltaNegative = delta != null && delta < 0;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm ${
        highlight ? "border-l-4 border-blue-500 border-zinc-200" : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
        </div>
        {delta != null && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
              deltaPositive
                ? "bg-emerald-50 text-emerald-700"
                : deltaNegative
                ? "bg-red-50 text-red-600"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {deltaPositive ? "arrow_upward" : deltaNegative ? "arrow_downward" : "remove"}
            </span>
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        {loading ? (
          <div
            className="mt-1.5 h-8 w-32 animate-pulse rounded-lg bg-zinc-200"
            aria-label="Cargando"
          />
        ) : (
          <p className={`mt-0.5 text-2xl font-bold ${highlight ? "text-blue-600" : "text-zinc-900"}`}>
            {displayValue}
          </p>
        )}
        {!loading && delta != null && (
          <p className={`mt-0.5 text-xs ${deltaPositive ? "text-emerald-600" : deltaNegative ? "text-red-500" : "text-zinc-400"}`}>
            vs período anterior
          </p>
        )}
      </div>
    </div>
  );
}
