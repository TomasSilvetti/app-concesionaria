"use client";

import React, { useState, useCallback } from "react";
import "material-symbols/outlined.css";

interface Participante {
  id: string;
  esConcecionaria: boolean;
  inversorId: string | null;
  inversorNombre: string | null;
  montoAporte: number;
  porcentajeParticipacion: number;
  porcentajeUtilidad: number | null;
}

interface Inversion {
  participantes: Participante[];
}

interface Props {
  operacionId: string;
  inversion: Inversion | null;
  precioVentaTotal: number;
  precioToma: number | null;
  gastosAsociados: number;
  estado: "abierta" | "cerrada" | "cancelada";
}

interface ParticipanteEdit {
  id: string;
  nombre: string;
  esConcecionaria: boolean;
  montoUtilidad: string;
  porcentajeUtilidad: string;
}

export function OperationInversionSection({
  operacionId,
  inversion,
  precioVentaTotal,
  precioToma,
  gastosAsociados,
  estado,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [participantesEdit, setParticipantesEdit] = useState<ParticipanteEdit[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const utilidadNeta = precioVentaTotal - (precioToma ?? 0) - gastosAsociados;

  const handleMontoChange = useCallback(
    (id: string, value: string) => {
      setParticipantesEdit((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const monto = parseFloat(value) || 0;
          const pct = utilidadNeta !== 0 ? (monto / utilidadNeta) * 100 : 0;
          return {
            ...p,
            montoUtilidad: value,
            porcentajeUtilidad: value === "" ? "" : pct.toFixed(2),
          };
        })
      );
    },
    [utilidadNeta]
  );

  const handlePorcentajeChange = useCallback(
    (id: string, value: string) => {
      setParticipantesEdit((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          const pct = parseFloat(value) || 0;
          const monto = utilidadNeta !== 0 ? (pct / 100) * utilidadNeta : 0;
          return {
            ...p,
            porcentajeUtilidad: value,
            montoUtilidad: value === "" ? "" : String(Math.round(monto)),
          };
        })
      );
    },
    [utilidadNeta]
  );

  if (!inversion) return null;

  const canEdit = estado === "abierta";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatPct = (value: number | null) =>
    value !== null ? `${value.toFixed(2)}%` : "—";

  const getNombre = (p: Participante) =>
    p.esConcecionaria ? "Concesionaria" : (p.inversorNombre ?? "Sin nombre");

  const handleStartEdit = () => {
    const initial: ParticipanteEdit[] = inversion.participantes.map((p) => {
      const pct = p.porcentajeUtilidad ?? 0;
      const monto = utilidadNeta !== 0 ? (pct / 100) * utilidadNeta : 0;
      return {
        id: p.id,
        nombre: getNombre(p),
        esConcecionaria: p.esConcecionaria,
        montoUtilidad: monto !== 0 ? String(Math.round(monto)) : "",
        porcentajeUtilidad: pct !== 0 ? String(pct) : "",
      };
    });
    setParticipantesEdit(initial);
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setParticipantesEdit([]);
    setSaveError(null);
  };

  const sumaMontos = participantesEdit.reduce(
    (acc, p) => acc + (parseFloat(p.montoUtilidad) || 0),
    0
  );
  const sumaPct = participantesEdit.reduce(
    (acc, p) => acc + (parseFloat(p.porcentajeUtilidad) || 0),
    0
  );

  const errorMonto =
    sumaMontos > utilidadNeta
      ? `La suma de montos (${formatCurrency(sumaMontos)}) supera la utilidad neta (${formatCurrency(utilidadNeta)})`
      : null;
  const errorPct =
    sumaPct > 100
      ? `La suma de porcentajes (${sumaPct.toFixed(2)}%) supera el 100%`
      : null;

  const hayErrores = !!errorMonto || !!errorPct;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = participantesEdit.map((p) => ({
        id: p.id,
        porcentajeUtilidad: parseFloat(p.porcentajeUtilidad) || 0,
      }));
      const res = await fetch(
        `/api/operations/${operacionId}/inversion/participantes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantes: payload }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "Error al guardar los cambios");
        return;
      }
      setIsEditing(false);
      setParticipantesEdit([]);
      // Recargar la página para reflejar los cambios guardados
      window.location.reload();
    } catch {
      setSaveError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const utilidadNetaCero = utilidadNeta === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl text-blue-600">
            pie_chart
          </span>
          <h2 className="text-lg font-semibold text-zinc-900">
            Distribución de utilidades
          </h2>
        </div>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Editar distribución de utilidades"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Editar
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || hayErrores}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving && (
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
              )}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 pb-6 flex flex-col gap-5">
        {/* Resumen financiero */}
        <div className="rounded-lg bg-zinc-50 border border-zinc-100 px-4 py-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Valor de venta
            </span>
            <span className="text-sm font-semibold text-zinc-900">
              {formatCurrency(precioVentaTotal)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Precio de toma
            </span>
            <span className="text-sm font-semibold text-zinc-900">
              {precioToma !== null ? formatCurrency(precioToma) : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Gastos asociados
            </span>
            <span className="text-sm font-semibold text-zinc-900">
              {formatCurrency(gastosAsociados)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Utilidad neta
            </span>
            <span
              className={`text-sm font-bold ${
                utilidadNeta > 0
                  ? "text-green-700"
                  : utilidadNeta < 0
                  ? "text-red-600"
                  : "text-zinc-500"
              }`}
            >
              {formatCurrency(utilidadNeta)}
            </span>
          </div>
        </div>

        {/* Tabla de participantes */}
        <div className="overflow-x-auto">
          {isEditing ? (
            /* Modo edición */
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Participante
                  </th>
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    % Participación
                  </th>
                  <th className="pb-3 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Monto utilidad
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    % Utilidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {participantesEdit.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {p.esConcecionaria && (
                          <span className="material-symbols-outlined text-sm text-blue-500">
                            business
                          </span>
                        )}
                        <span className="text-sm font-medium text-zinc-900">
                          {p.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-zinc-500">
                      {formatPct(
                        inversion.participantes.find((x) => x.id === p.id)
                          ?.porcentajeParticipacion ?? null
                      )}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {utilidadNetaCero ? (
                        <span className="text-sm text-zinc-400">—</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={p.montoUtilidad}
                          onChange={(e) => handleMontoChange(p.id, e.target.value)}
                          placeholder="0"
                          disabled={saving}
                          className={`h-9 w-32 rounded-lg border bg-zinc-50 px-3 text-right text-sm text-zinc-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 ${
                            errorMonto
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                              : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          aria-label={`Monto de utilidad de ${p.nombre}`}
                        />
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {utilidadNetaCero ? (
                        <span className="text-sm text-zinc-400">—</span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={p.porcentajeUtilidad}
                          onChange={(e) => handlePorcentajeChange(p.id, e.target.value)}
                          placeholder="0"
                          disabled={saving}
                          className={`h-9 w-24 rounded-lg border bg-zinc-50 px-3 text-right text-sm text-zinc-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 ${
                            errorPct
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                              : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          aria-label={`Porcentaje de utilidad de ${p.nombre}`}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Modo lectura */
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Participante
                  </th>
                  <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    % Participación
                  </th>
                  <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Monto utilidad
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    % Utilidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {inversion.participantes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-sm text-zinc-400"
                    >
                      Sin participantes registrados
                    </td>
                  </tr>
                ) : (
                  inversion.participantes.map((p) => {
                    const pct = p.porcentajeUtilidad ?? 0;
                    const montoUtilidad =
                      utilidadNeta !== 0 ? (pct / 100) * utilidadNeta : null;
                    return (
                      <tr key={p.id}>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {p.esConcecionaria && (
                              <span className="material-symbols-outlined text-sm text-blue-500">
                                business
                              </span>
                            )}
                            <span className="text-sm font-medium text-zinc-900">
                              {getNombre(p)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-zinc-500">
                          {formatPct(p.porcentajeParticipacion)}
                        </td>
                        <td className="py-3 pr-4 text-right text-sm font-medium text-zinc-900">
                          {utilidadNetaCero || montoUtilidad === null || pct === 0
                            ? "—"
                            : formatCurrency(montoUtilidad)}
                        </td>
                        <td className="py-3 text-right">
                          {utilidadNetaCero || pct === 0 ? (
                            <span className="text-sm text-zinc-400">—</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {formatPct(pct)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {(errorMonto || errorPct) && (
          <div className="flex flex-col gap-1.5">
            {errorMonto && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {errorMonto}
              </p>
            )}
            {errorPct && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {errorPct}
              </p>
            )}
          </div>
        )}

        {saveError && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {saveError}
          </p>
        )}

        {estado !== "abierta" && (
          <p className="text-xs text-zinc-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">lock</span>
            Esta operación está {estado} y no permite cambios en la distribución.
          </p>
        )}
      </div>
    </div>
  );
}
