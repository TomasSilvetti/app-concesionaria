"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PaymentModal } from "./PaymentModal";
import "material-symbols/outlined.css";

interface Pago {
  id: string;
  fecha: string;
  monto: number;
  nota: string | null;
  metodoPagoId: string;
  metodoPagoNombre: string;
}

interface Props {
  operacionId: string;
  precioVentaTotal: number;
}

export function OperationCobranzasSection({ operacionId, precioVentaTotal }: Props) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [saldado, setSaldado] = useState(0);
  const [pendiente, setPendiente] = useState(precioVentaTotal);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/operations/${operacionId}/pagos`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPagos(data.pagos ?? []);
      setSaldado(data.saldado ?? 0);
      setPendiente(data.pendiente ?? precioVentaTotal);
    } catch {
      setError("No se pudieron cargar los pagos");
    } finally {
      setLoading(false);
    }
  }, [operacionId, precioVentaTotal]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  async function handleSave(data: {
    fecha: string;
    metodoPagoId: string;
    monto: number;
    nota?: string;
  }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/operations/${operacionId}/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();

      setPagos((prev) => [
        ...prev,
        {
          id: result.pago.id,
          fecha: result.pago.fecha,
          monto: result.pago.monto,
          nota: result.pago.nota ?? null,
          metodoPagoId: result.pago.metodoPagoId,
          metodoPagoNombre: result.pago.metodoPagoNombre,
        },
      ]);
      setSaldado(result.saldado);
      setPendiente(result.pendiente);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              account_balance_wallet
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">Cobranzas</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Agregar pago"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Agregar pago
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="material-symbols-outlined animate-spin text-2xl text-blue-600">
              progress_activity
            </span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Tabla de pagos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Fecha
                    </th>
                    <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Forma de pago
                    </th>
                    <th className="pb-3 pr-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Monto
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Nota
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {pagos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-sm text-zinc-400"
                      >
                        Sin pagos registrados
                      </td>
                    </tr>
                  ) : (
                    pagos.map((pago) => (
                      <tr key={pago.id} className="hover:bg-zinc-50">
                        <td className="py-3 pr-4 text-sm text-zinc-900">
                          {formatDate(pago.fecha)}
                        </td>
                        <td className="py-3 pr-4 text-sm text-zinc-600">
                          {pago.metodoPagoNombre}
                        </td>
                        <td className="py-3 pr-4 text-right text-sm font-medium text-zinc-900">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="py-3 text-sm text-zinc-500">
                          {pago.nota ?? <span className="text-zinc-300">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Saldado
                </span>
                <span className="text-base font-semibold text-green-600">
                  {formatCurrency(saldado)}
                </span>
              </div>
              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Pendiente
                </span>
                <span
                  className={`text-base font-semibold ${
                    pendiente === 0 ? "text-zinc-400" : "text-red-600"
                  }`}
                >
                  {formatCurrency(pendiente)}
                </span>
              </div>
              {pendiente === 0 && (
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Saldado
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PaymentModal
          operacionId={operacionId}
          pendiente={pendiente}
          onSave={handleSave}
          onClose={() => !saving && setShowModal(false)}
        />
      )}
    </>
  );
}
