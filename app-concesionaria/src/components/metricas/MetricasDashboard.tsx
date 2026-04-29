"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths, subWeeks, startOfYear } from "date-fns";
import "material-symbols/outlined.css";
import { ResultadoMensualChart } from "./ResultadoMensualChart";
import { CobrosChart } from "./CobrosChart";
import { RoiInversorTable } from "./RoiInversorTable";

type Preset = "semana" | "mes_actual" | "mes_anterior" | "anio" | "custom";

interface PeriodRange {
  desde: string;
  hasta: string;
}

function getPresetRange(preset: Preset): PeriodRange {
  const today = new Date();
  switch (preset) {
    case "semana":
      return {
        desde: format(subWeeks(today, 1), "yyyy-MM-dd"),
        hasta: format(today, "yyyy-MM-dd"),
      };
    case "mes_actual":
      return {
        desde: format(startOfMonth(today), "yyyy-MM-dd"),
        hasta: format(endOfMonth(today), "yyyy-MM-dd"),
      };
    case "mes_anterior": {
      const lastMonth = subMonths(today, 1);
      return {
        desde: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
        hasta: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
      };
    }
    case "anio":
      return {
        desde: format(startOfYear(today), "yyyy-MM-dd"),
        hasta: format(today, "yyyy-MM-dd"),
      };
    default:
      return {
        desde: format(startOfMonth(today), "yyyy-MM-dd"),
        hasta: format(endOfMonth(today), "yyyy-MM-dd"),
      };
  }
}

export function MetricasDashboard() {
  const defaultRange = getPresetRange("mes_actual");
  const [preset, setPreset] = useState<Preset>("mes_actual");
  const [desde, setDesde] = useState(defaultRange.desde);
  const [hasta, setHasta] = useState(defaultRange.hasta);
  const [customError, setCustomError] = useState("");

  const handlePresetChange = (value: Preset) => {
    setPreset(value);
    setCustomError("");
    if (value !== "custom") {
      const range = getPresetRange(value);
      setDesde(range.desde);
      setHasta(range.hasta);
    }
  };

  const handleDesdeChange = (value: string) => {
    setDesde(value);
    setPreset("custom");
    if (hasta && value > hasta) {
      setCustomError("La fecha de inicio no puede ser posterior a la fecha de fin.");
    } else {
      setCustomError("");
    }
  };

  const handleHastaChange = (value: string) => {
    setHasta(value);
    setPreset("custom");
    if (desde && value < desde) {
      setCustomError("La fecha de fin no puede ser anterior a la fecha de inicio.");
    } else {
      setCustomError("");
    }
  };

  const isRangeValid = !customError && !!desde && !!hasta;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="material-symbols-outlined text-3xl text-white">
              bar_chart
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Métricas</h1>
            <p className="text-sm text-zinc-500">
              Indicadores clave del negocio por período.
            </p>
          </div>
        </div>

        {/* Selector de período */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Período
              </label>
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value as Preset)}
                className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Seleccionar período"
              >
                <option value="semana">Última semana</option>
                <option value="mes_actual">Mes actual</option>
                <option value="mes_anterior">Mes anterior</option>
                <option value="anio">Año actual</option>
                <option value="custom">Rango personalizado</option>
              </select>
            </div>

            {preset === "custom" && (
              <>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="metricas-desde"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Desde
                  </label>
                  <input
                    id="metricas-desde"
                    type="date"
                    value={desde}
                    onChange={(e) => handleDesdeChange(e.target.value)}
                    className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    aria-label="Fecha desde"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="metricas-hasta"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Hasta
                  </label>
                  <input
                    id="metricas-hasta"
                    type="date"
                    value={hasta}
                    onChange={(e) => handleHastaChange(e.target.value)}
                    className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    aria-label="Fecha hasta"
                  />
                </div>
              </>
            )}
          </div>
          {customError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {customError}
            </p>
          )}
        </div>
      </div>

      {isRangeValid && (
        <>
          {/* Resultado mensual */}
          <ResultadoMensualChart desde={desde} hasta={hasta} />

          {/* Cobros por método de pago */}
          <CobrosChart desde={desde} hasta={hasta} />

          {/* ROI por inversor */}
          <RoiInversorTable desde={desde} hasta={hasta} />
        </>
      )}
    </div>
  );
}
