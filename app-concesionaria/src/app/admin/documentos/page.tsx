"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PlantillasTable } from "@/components/documents/PlantillasTable";

export default function DocumentosAdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreatePlantilla = () => {
    // porcion-004: modal/página de creación de plantilla
    alert("Crear plantilla — próximamente (porcion-004)");
  };

  const handleEditPlantilla = (plantilla: { id: string; nombre: string }) => {
    // porcion-006: modal/página de edición de plantilla
    alert(`Editar "${plantilla.nombre}" — próximamente (porcion-006)`);
  };

  const handleAsignarEmpresas = (plantilla: { id: string; nombre: string }) => {
    // porcion-008: modal de asignación de empresas
    alert(`Asignar empresas a "${plantilla.nombre}" — próximamente (porcion-008)`);
  };

  return (
    <AppLayout>
      <PlantillasTable
        onCreatePlantilla={handleCreatePlantilla}
        onEditPlantilla={handleEditPlantilla}
        onAsignarEmpresas={handleAsignarEmpresas}
        refreshTrigger={refreshTrigger}
      />
    </AppLayout>
  );
}
