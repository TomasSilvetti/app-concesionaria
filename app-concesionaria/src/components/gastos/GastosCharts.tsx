"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import "material-symbols/outlined.css";

interface GastosChartsProps {
  desde: string;
  hasta: string;
}

function formatPesosShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// ─── Gráfico de Operaciones ───────────────────────────────────────────────────

interface OperacionesPorEstado {
  cerradas: number;
  canceladas: number;
  abiertas: number;
  total: number;
}

function GraficoOperaciones({ desde, hasta }: { desde: string; hasta: string }) {
  const [datos, setDatos] = useState<OperacionesPorEstado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gastos/operaciones-por-estado?desde=${desde}&hasta=${hasta}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: OperacionesPorEstado) => setDatos(data))
      .catch(() => setDatos({ cerradas: 0, canceladas: 0, abiertas: 0, total: 0 }))
      .finally(() => setLoading(false));
  }, [desde, hasta]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <span className="text-sm text-zinc-400">Cargando...</span>
      </div>
    );
  }

  const { cerradas, canceladas, abiertas, total } = datos ?? {
    cerradas: 0,
    canceladas: 0,
    abiertas: 0,
    total: 0,
  };

  const data = [
    { name: "Cerradas", value: cerradas, color: "#2563EB" },
    { name: "Canceladas", value: canceladas, color: "#EF4444" },
    { name: "Abiertas", value: abiertas, color: "#D1D5DB" },
  ];

  const hasData = total > 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-base font-semibold text-zinc-900">Estado de Operaciones</p>
        <p className="text-xs text-zinc-400">Período seleccionado</p>
      </div>

      {hasData ? (
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <PieChart width={180} height={180}>
              <Pie
                data={data}
                cx={85}
                cy={85}
                innerRadius={58}
                outerRadius={82}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    return (
                      <text textAnchor="middle">
                        <tspan
                          x={cx}
                          y={cy - 6}
                          fontSize={28}
                          fontWeight={700}
                          fill="#18181b"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 14}
                          fontSize={9}
                          fontWeight={500}
                          fill="#71717a"
                        >
                          TOTAL GRAL
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </div>

          <div className="flex flex-col gap-3">
            {data.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-8"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-zinc-600">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-zinc-900">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-400"
          role="status"
          aria-label="Sin datos de operaciones"
        >
          <span className="material-symbols-outlined text-4xl">
            pie_chart
          </span>
          <p className="text-center text-sm">
            Sin operaciones cerradas ni canceladas en este período
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Gráfico de Inventario ────────────────────────────────────────────────────

interface InventarioData {
  valorRevista: number;
  valorRealToma: number;
}

function GraficoInventario() {
  const [datos, setDatos] = useState<InventarioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gastos/inventario")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: InventarioData) => setDatos(data))
      .catch(() => setDatos({ valorRevista: 0, valorRealToma: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <span className="text-sm text-zinc-400">Cargando...</span>
      </div>
    );
  }

  const { valorRevista, valorRealToma } = datos ?? {
    valorRevista: 0,
    valorRealToma: 0,
  };
  const totalValor = valorRevista + valorRealToma;

  const data = [
    { name: "Valor Revista", value: valorRevista, color: "#2563EB" },
    { name: "Precio Real Toma", value: valorRealToma, color: "#10B981" },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-base font-semibold text-zinc-900">Estado del Inventario</p>
        <p className="text-xs text-zinc-400">Estado Actual</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <PieChart width={180} height={180}>
            <Pie
              data={data}
              cx={85}
              cy={85}
              innerRadius={58}
              outerRadius={82}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  const { cx, cy } = viewBox as { cx: number; cy: number };
                  return (
                    <text textAnchor="middle">
                      <tspan
                        x={cx}
                        y={cy - 6}
                        fontSize={20}
                        fontWeight={700}
                        fill="#18181b"
                      >
                        {formatPesosShort(totalValor)}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 14}
                        fontSize={9}
                        fontWeight={500}
                        fill="#71717a"
                      >
                        VALOR TOTAL
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </div>

        <div className="flex flex-col gap-3">
          {data.map((entry) => (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-8"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span className="text-sm text-zinc-600">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">
                {formatPesosShort(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function GastosCharts({ desde, hasta }: GastosChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <GraficoOperaciones desde={desde} hasta={hasta} />
      <GraficoInventario />
    </div>
  );
}
