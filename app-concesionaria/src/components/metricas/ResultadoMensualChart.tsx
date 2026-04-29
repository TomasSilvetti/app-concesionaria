"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "material-symbols/outlined.css";

interface ResultadoMensualPoint {
  mes: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
}

interface ResultadoMensualChartProps {
  desde: string;
  hasta: string;
}

async function fetchResultadoMensual(
  desde: string,
  hasta: string
): Promise<ResultadoMensualPoint[]> {
  const res = await fetch(`/api/cliente/metricas/resultado-mensual?desde=${desde}&hasta=${hasta}`);
  if (!res.ok) throw new Error("Error al obtener resultado mensual");
  return res.json();
}

function formatARS(value: number) {
  return `$ ${value.toLocaleString("es-AR")}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-md text-sm min-w-[180px]">
      <p className="mb-2 font-semibold text-zinc-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="leading-5">
          {entry.name}:{" "}
          <span className="font-bold">{formatARS(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function ResultadoMensualChart({ desde, hasta }: ResultadoMensualChartProps) {
  const [data, setData] = useState<ResultadoMensualPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchResultadoMensual(desde, hasta);
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

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
          <span className="material-symbols-outlined text-xl text-emerald-600">
            trending_up
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Resultado mensual</h2>
          <p className="text-xs text-zinc-500">
            Ingresos, gastos y ganancia neta por mes
          </p>
        </div>
      </div>

      {loading && (
        <div className="h-56 w-full animate-pulse rounded-lg bg-zinc-200" aria-label="Cargando" />
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span className="material-symbols-outlined text-xl text-red-500">error</span>
          No se pudieron cargar los datos de resultado mensual.
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400">
          <span className="material-symbols-outlined text-4xl">bar_chart</span>
          <p className="text-sm">Sin datos para el período seleccionado</p>
        </div>
      )}

      {!loading && !error && !isEmpty && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f4f5" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "#71717a", paddingTop: 12 }}
            />
            <Bar dataKey="ingresos" name="Ingresos" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ganancia" name="Ganancia neta" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
