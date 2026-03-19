"use client";

import { useEffect, useState } from "react";

interface PaymentMethod {
  id: string;
  nombre: string;
}

interface PaymentData {
  fecha: string;
  metodoPagoId: string;
  monto: number;
  nota?: string;
}

interface PaymentModalProps {
  operacionId: string;
  pendiente: number;
  onSave: (data: PaymentData) => void;
  onClose: () => void;
}

export function PaymentModal({ pendiente, onSave, onClose }: PaymentModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");

  const [nuevoMetodoNombre, setNuevoMetodoNombre] = useState("");
  const [addingMethod, setAddingMethod] = useState(false);
  const [addMethodError, setAddMethodError] = useState("");

  const [montoError, setMontoError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  async function fetchPaymentMethods() {
    setLoadingMethods(true);
    try {
      const res = await fetch("/api/payment-methods");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods ?? []);
      }
    } finally {
      setLoadingMethods(false);
    }
  }

  async function handleAddMethod() {
    const nombre = nuevoMetodoNombre.trim();
    if (!nombre) return;

    setAddMethodError("");
    setAddingMethod(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddMethodError(data.error ?? "Error al agregar");
        return;
      }
      setPaymentMethods((prev) =>
        [...prev, data.paymentMethod].sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      setMetodoPagoId(data.paymentMethod.id);
      setNuevoMetodoNombre("");
    } finally {
      setAddingMethod(false);
    }
  }

  function handleMontoChange(value: string) {
    setMonto(value);
    const num = parseFloat(value);
    if (value !== "" && (isNaN(num) || num <= 0)) {
      setMontoError("El monto debe ser mayor a cero");
    } else {
      setMontoError("");
    }
  }

  function handlePagoTodo() {
    setMonto(String(pendiente));
    setMontoError("");
  }

  const montoNum = parseFloat(monto);
  const isSaveDisabled =
    saving ||
    !fecha ||
    !metodoPagoId ||
    !monto ||
    isNaN(montoNum) ||
    montoNum <= 0;

  async function handleSave() {
    if (isSaveDisabled) return;
    setSaving(true);
    try {
      await onSave({
        fecha,
        metodoPagoId,
        monto: montoNum,
        nota: nota.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Registrar pago"
      onClick={handleBackdropClick}
    >
      <div className="flex w-full max-w-md flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-blue-600">
              payments
            </span>
            <h2 className="text-lg font-semibold text-zinc-900">Registrar pago</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-fecha" className="text-sm font-medium text-zinc-700">
              Fecha
            </label>
            <input
              id="pago-fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={saving}
              className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>

          {/* Forma de pago */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-metodo" className="text-sm font-medium text-zinc-700">
              Forma de pago
            </label>
            {loadingMethods ? (
              <div className="flex h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-zinc-50 px-4">
                <span className="material-symbols-outlined animate-spin text-sm text-zinc-400">
                  progress_activity
                </span>
                <span className="text-sm text-zinc-400">Cargando...</span>
              </div>
            ) : (
              <select
                id="pago-metodo"
                value={metodoPagoId}
                onChange={(e) => setMetodoPagoId(e.target.value)}
                disabled={saving}
                className="h-11 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Agregar nueva forma de pago */}
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoMetodoNombre}
                onChange={(e) => {
                  setNuevoMetodoNombre(e.target.value);
                  setAddMethodError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMethod();
                  }
                }}
                placeholder="Agregar nueva..."
                disabled={saving || addingMethod}
                className="h-8 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 disabled:opacity-50"
                aria-label="Nombre de nueva forma de pago"
              />
              <button
                type="button"
                onClick={handleAddMethod}
                disabled={!nuevoMetodoNombre.trim() || saving || addingMethod}
                className="flex h-8 items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-40"
              >
                {addingMethod ? (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">add</span>
                )}
                Agregar
              </button>
            </div>
            {addMethodError && (
              <p className="text-xs text-red-600">{addMethodError}</p>
            )}
          </div>

          {/* Monto */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="pago-monto" className="text-sm font-medium text-zinc-700">
                Monto
              </label>
              <button
                type="button"
                onClick={handlePagoTodo}
                disabled={saving}
                className="flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                Pagó todo
              </button>
            </div>
            <input
              id="pago-monto"
              type="number"
              min="0"
              step="1"
              value={monto}
              onChange={(e) => handleMontoChange(e.target.value)}
              placeholder="0"
              disabled={saving}
              className={`h-11 w-full rounded-lg border bg-zinc-50 px-4 text-sm text-zinc-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 ${
                montoError
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {montoError && (
              <p className="text-xs text-red-600">{montoError}</p>
            )}
          </div>

          {/* Nota (opcional) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pago-nota" className="text-sm font-medium text-zinc-700">
              Nota{" "}
              <span className="font-normal text-zinc-400">(opcional)</span>
            </label>
            <textarea
              id="pago-nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Seña, cuota 1..."
              rows={2}
              disabled={saving}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-zinc-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && (
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
