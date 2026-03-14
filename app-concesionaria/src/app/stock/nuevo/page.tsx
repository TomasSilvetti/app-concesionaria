"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateVehicleForm } from "@/components/stock/CreateVehicleForm";
import "material-symbols/outlined.css";

export default function NuevoVehiculoPage() {
  const router = useRouter();

  const handleSuccess = () => {
    setTimeout(() => {
      router.push("/stock");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/stock");
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/stock")}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Volver al stock"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <span className="material-symbols-outlined text-3xl text-white">
                add_circle
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">
                Agregar Vehículo
              </h1>
              <p className="text-sm text-zinc-500">
                Completá los datos del nuevo vehículo
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <CreateVehicleForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </AppLayout>
  );
}
