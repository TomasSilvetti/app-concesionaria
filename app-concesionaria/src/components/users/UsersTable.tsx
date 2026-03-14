"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "material-symbols/outlined.css";

interface User {
  id: string;
  username: string;
  nombre: string;
  rol: "admin" | "usuario";
  clienteId: string | null;
  clienteNombre?: string | null;
  activo: boolean;
}

interface UsersTableProps {
  onCreateUser: () => void;
  refreshTrigger?: number;
}

type RolFilter = "todos" | "admin" | "usuario";
type EstadoFilter = "todos" | "activos" | "inactivos";

export function UsersTable({ onCreateUser, refreshTrigger }: UsersTableProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolFilter, setRolFilter] = useState<RolFilter>("todos");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos");
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("=== DEBUG SESSION ===");
      console.log("User rol:", session?.user?.rol);
      console.log("User id:", session?.user?.id);
      console.log("Full session:", session);
    }
  }, [status, session]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    console.log("Session data:", session);
    console.log("User role:", session?.user?.rol);

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      
      const params = new URLSearchParams();
      if (rolFilter !== "todos") {
        params.append("rol", rolFilter);
      }
      if (estadoFilter === "activos") {
        params.append("activo", "true");
      } else if (estadoFilter === "inactivos") {
        params.append("activo", "false");
      }
      
      const queryString = params.toString();
      const url = `${baseUrl}/api/users${queryString ? `?${queryString}` : ""}`;
      
      console.log("Fetching users from:", url);
      const res = await fetch(url);
      console.log("Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Users data received:", data);
        setUsers(data.users ?? data ?? []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Error fetching users:", res.status, errorData);
        
        if (res.status === 403) {
          setError("No tenés permisos para ver usuarios. Solo administradores pueden acceder.");
        } else if (res.status === 401) {
          setError("Sesión expirada. Por favor, iniciá sesión nuevamente.");
          router.push("/login?expired=1");
        } else {
          setError(errorData.message || "Error al cargar usuarios");
        }
        setUsers([]);
      }
    } catch (error) {
      console.error("Exception fetching users:", error);
      setError("Error de conexión. Verificá tu conexión a internet.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [refreshTrigger, rolFilter, estadoFilter, status]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleToggleClick = (user: User) => {
    if (user.activo) {
      setUserToToggle(user);
      setShowConfirmModal(true);
    } else {
      toggleUserStatus(user, true);
    }
  };

  const toggleUserStatus = async (user: User, newStatus: boolean) => {
    setIsToggling(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch(`${baseUrl}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo: newStatus }),
      });

      if (res.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id ? { ...u, activo: newStatus } : u
          )
        );
        setSuccessMessage(
          newStatus
            ? "Usuario activado exitosamente"
            : "Usuario desactivado exitosamente"
        );
      } else {
        alert("Error al cambiar el estado del usuario");
      }
    } catch {
      alert("Error al cambiar el estado del usuario");
    } finally {
      setIsToggling(false);
      setShowConfirmModal(false);
      setUserToToggle(null);
    }
  };

  const handleConfirmDeactivate = () => {
    if (userToToggle) {
      toggleUserStatus(userToToggle, false);
    }
  };

  const handleCancelDeactivate = () => {
    setShowConfirmModal(false);
    setUserToToggle(null);
  };

  const getInitials = (nombre: string) => {
    const parts = nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-indigo-500",
    ];
    const index =
      username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-lg text-zinc-600">
            Administra los accesos y roles de todo el personal del concesionario.
          </p>
        </div>
        <button
          onClick={onCreateUser}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="material-symbols-outlined text-lg">tune</span>
            <span className="font-medium">Filtros:</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="rol-filter" className="text-sm text-zinc-600">
                Rol:
              </label>
              <div className="relative">
                <select
                  id="rol-filter"
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value as RolFilter)}
                  className="h-9 appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 text-sm text-zinc-900 transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="todos">Todos</option>
                  <option value="admin">Admin</option>
                  <option value="usuario">Usuario</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-zinc-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="estado-filter" className="text-sm text-zinc-600">
                Estado:
              </label>
              <div className="relative">
                <select
                  id="estado-filter"
                  value={estadoFilter}
                  onChange={(e) =>
                    setEstadoFilter(e.target.value as EstadoFilter)
                  }
                  className="h-9 appearance-none rounded-lg border border-zinc-300 bg-white pl-3 pr-8 text-sm text-zinc-900 transition-colors hover:border-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base text-zinc-400">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="ml-auto text-sm text-zinc-500">
            {users.length} {users.length === 1 ? "usuario" : "usuarios"}
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="material-symbols-outlined text-4xl text-red-600">
                error
              </span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">
              Error al cargar usuarios
            </p>
            <p className="mt-1 text-sm text-zinc-600">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Reintentar
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
              progress_activity
            </span>
            <p className="mt-4 text-sm text-zinc-600">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <span className="material-symbols-outlined text-4xl text-zinc-400">
                person_off
              </span>
            </div>
            <p className="mt-4 text-base font-medium text-zinc-900">
              No hay usuarios
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              No se encontraron usuarios con los filtros aplicados
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-lg border border-zinc-200 lg:block">
              <table className="w-full">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Client/Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(user.username)}`}
                          >
                            {getInitials(user.nombre)}
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-900">
                          {user.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.rol === "admin"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {user.rol === "admin" ? "shield" : "badge"}
                          </span>
                          {user.rol === "admin" ? "Admin" : "Vendedor"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.clienteNombre ? (
                          <div className="flex items-center gap-1.5 text-sm text-zinc-700">
                            <span className="material-symbols-outlined text-base text-zinc-400">
                              store
                            </span>
                            {user.clienteNombre}
                          </div>
                        ) : (
                          <span className="text-sm text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.activo ? "bg-green-600" : "bg-zinc-400"
                            }`}
                          />
                          {user.activo ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleClick(user)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            user.activo
                              ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus:ring-zinc-500"
                              : "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                          aria-label={
                            user.activo
                              ? `Desactivar usuario ${user.username}`
                              : `Activar usuario ${user.username}`
                          }
                        >
                          <span className="material-symbols-outlined text-base">
                            {user.activo ? "toggle_on" : "toggle_off"}
                          </span>
                          {user.activo ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 lg:hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${getAvatarColor(user.username)}`}
                    >
                      {getInitials(user.nombre)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-zinc-900">
                            {user.nombre}
                          </h3>
                          <p className="text-sm text-zinc-600">
                            @{user.username}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.activo
                              ? "bg-green-50 text-green-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.activo ? "bg-green-600" : "bg-zinc-400"
                            }`}
                          />
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.rol === "admin"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {user.rol === "admin" ? "shield" : "badge"}
                          </span>
                          {user.rol === "admin" ? "Administrador" : "Vendedor"}
                        </span>
                        {user.clienteNombre && (
                          <div className="flex items-center gap-1 text-xs text-zinc-600">
                            <span className="material-symbols-outlined text-sm text-zinc-400">
                              store
                            </span>
                            {user.clienteNombre}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-zinc-200">
                        <button
                          onClick={() => handleToggleClick(user)}
                          disabled={isToggling}
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            user.activo
                              ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 focus:ring-zinc-500"
                              : "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                          aria-label={
                            user.activo
                              ? `Desactivar usuario ${user.username}`
                              : `Activar usuario ${user.username}`
                          }
                        >
                          <span className="material-symbols-outlined text-lg">
                            {user.activo ? "toggle_on" : "toggle_off"}
                          </span>
                          {user.activo ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {showConfirmModal && userToToggle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          onClick={handleCancelDeactivate}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <span className="material-symbols-outlined text-2xl text-orange-600">
                  warning
                </span>
              </div>
              <h2
                id="confirm-modal-title"
                className="text-xl font-semibold text-zinc-900"
              >
                Confirmar desactivación
              </h2>
            </div>
            <p className="mb-6 text-sm text-zinc-600">
              ¿Estás seguro de desactivar este usuario?
            </p>
            <div className="mb-4 rounded-lg bg-zinc-50 p-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(userToToggle.username)}`}
                >
                  {getInitials(userToToggle.nombre)}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {userToToggle.nombre}
                  </p>
                  <p className="text-xs text-zinc-600">
                    @{userToToggle.username}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDeactivate}
                disabled={isToggling}
                className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={isToggling}
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isToggling ? "Desactivando..." : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
