"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CreateUserForm } from "@/components/users/CreateUserForm";
import { UsersTable } from "@/components/users/UsersTable";
import "material-symbols/outlined.css";

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUserCreated = () => {
    setIsModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <UsersTable
        onCreateUser={() => setIsModalOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-zinc-900"
              >
                Crear nuevo usuario
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <CreateUserForm
              onSuccess={handleUserCreated}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
