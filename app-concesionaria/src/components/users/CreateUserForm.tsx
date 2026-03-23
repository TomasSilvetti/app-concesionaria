"use client";

import React, { useState, useEffect, useCallback } from "react";
import "material-symbols/outlined.css";

interface Client {
  id: string;
  nombre: string;
}

interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const [username, setUsername] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"admin" | "usuario">("usuario");
  const [clienteId, setClienteId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientNombre, setNewClientNombre] = useState("");
  const [newClientLoading, setNewClientLoading] = useState(false);
  const [newClientError, setNewClientError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/clients`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients ?? data ?? []);
      } else {
        setClients([]);
      }
    } catch {
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (rol === "usuario") {
      fetchClients();
    } else {
      setClientsLoading(false);
      setClients([]);
    }
  }, [rol, fetchClients]);

  const isFormValid =
    username.trim() !== "" &&
    nombreCompleto.trim() !== "" &&
    password.trim() !== "" &&
    (rol === "admin" || (rol === "usuario" && clienteId.trim() !== ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const body: Record<string, string> = {
        username: username.trim(),
        nombre: nombreCompleto.trim(),
        password,
        rol,
      };
      if (rol === "usuario" && clienteId) {
        body.clienteId = clienteId;
      }

      const res = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        setSuccessMessage("Usuario creado exitosamente");
        setUsername("");
        setNombreCompleto("");
        setPassword("");
        setRol("usuario");
        setClienteId("");
        onSuccess?.();
      } else if (res.status === 409) {
        setError("El nombre de usuario ya existe. Elegí otro.");
      } else if (res.status === 400) {
        setError(data.message ?? "Datos inválidos. Verificá los campos.");
      } else {
        setError(
          data.message ?? "Ocurrió un error al crear el usuario. Intentá nuevamente."
        );
      }
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRolChange = (newRol: "admin" | "usuario") => {
    setRol(newRol);
    if (newRol === "admin") {
      setClienteId("");
    }
    setError(null);
  };

  const handleInputChange = () => {
    if (error) setError(null);
  };

  const handleCreateClient = async () => {
    const nombre = newClientNombre.trim();
    if (!nombre) return;
    setNewClientLoading(true);
    setNewClientError(null);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        const created: Client = data.client;
        setClients((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setClienteId(created.id);
        setShowNewClientForm(false);
        setNewClientNombre("");
      } else {
        setNewClientError(data.error ?? "Error al crear el cliente");
      }
    } catch {
      setNewClientError("No se pudo conectar con el servidor");
    } finally {
      setNewClientLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-medium text-zinc-700">
          Nombre de usuario
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
            person
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              handleInputChange();
            }}
            placeholder="jperez"
            className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nombreCompleto"
          className="text-sm font-medium text-zinc-700"
        >
          Nombre completo
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
            badge
          </span>
          <input
            id="nombreCompleto"
            type="text"
            value={nombreCompleto}
            onChange={(e) => {
              setNombreCompleto(e.target.value.toUpperCase());
              handleInputChange();
            }}
            placeholder="Juan Pérez"
            className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
            autoComplete="name"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Contraseña
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
            lock
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            placeholder="Mínimo 6 caracteres"
            className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-12 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none focus:text-zinc-600"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="rol" className="text-sm font-medium text-zinc-700">
          Rol
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
            admin_panel_settings
          </span>
          <select
            id="rol"
            value={rol}
            onChange={(e) =>
              handleRolChange(e.target.value as "admin" | "usuario")
            }
            className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="admin">Administrador</option>
            <option value="usuario">Usuario</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
            expand_more
          </span>
        </div>
      </div>

      {rol === "usuario" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cliente" className="text-sm font-medium text-zinc-700">
              Cliente
            </label>
            {!showNewClientForm && (
              <button
                type="button"
                onClick={() => { setShowNewClientForm(true); setNewClientError(null); }}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                disabled={isLoading}
              >
                <span className="material-symbols-outlined text-base">add</span>
                Agregar cliente
              </button>
            )}
          </div>

          {showNewClientForm ? (
            <div className="flex flex-col gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-700">Nuevo cliente (concesionaria)</p>
              <input
                type="text"
                value={newClientNombre}
                onChange={(e) => { setNewClientNombre(e.target.value.toUpperCase()); setNewClientError(null); }}
                placeholder="Nombre de la concesionaria"
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={newClientLoading}
                autoFocus
              />
              {newClientError && (
                <p className="text-xs text-red-600">{newClientError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={newClientLoading || !newClientNombre.trim()}
                  className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {newClientLoading ? (
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      Guardar
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewClientForm(false); setNewClientNombre(""); setNewClientError(null); }}
                  disabled={newClientLoading}
                  className="flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                group
              </span>
              <select
                id="cliente"
                value={clienteId}
                onChange={(e) => {
                  setClienteId(e.target.value);
                  handleInputChange();
                }}
                className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-10 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                disabled={isLoading || clientsLoading}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xl text-zinc-400">
                expand_more
              </span>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="order-2 sm:order-1 flex h-12 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="order-1 sm:order-2 flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:flex-initial sm:px-6"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl">
                progress_activity
              </span>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <span>Guardar</span>
              <span className="material-symbols-outlined text-xl">save</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
