"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "material-symbols/outlined.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("logout") === "success") {
      setSuccessMessage("Sesión cerrada exitosamente");
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
    if (searchParams.get("expired") === "1") {
      setError("Tu sesión ha expirado. Por favor, iniciá sesión nuevamente");
    }
  }, [searchParams]);

  const isFormValid = username.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("ACCOUNT_INACTIVE")) {
          setError("Tu cuenta está inactiva. Contactá al administrador");
        } else if (result.error.includes("INVALID_CREDENTIALS")) {
          setError("Nombre de usuario o contraseña incorrectos");
        } else if (result.error === "CredentialsSignin") {
          setError("Nombre de usuario o contraseña incorrectos");
        } else {
          setError("Nombre de usuario o contraseña incorrectos");
        }
      } else if (result?.ok) {
        const session = await getSession();
        if (session?.user?.rol === "admin") {
          router.push("/dashboard");
        } else if (
          session?.user?.rol === "usuario" &&
          session?.user?.clienteId
        ) {
          router.push(`/cliente/${session.user.clienteId}/dashboard`);
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error. Intentá nuevamente");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-zinc-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white px-8 py-10 shadow-xl">
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
              <span className="material-symbols-outlined text-4xl text-white">
                directions_car
              </span>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-900">Nordem</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Portal de Gestión de Concesionario
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-900">Iniciar Sesión</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="text-sm font-medium text-zinc-700">
                Usuario
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
                  placeholder="nombre@concesionario.com"
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={isLoading}
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
                  placeholder="Introducé tu contraseña"
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-11 pr-12 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={isLoading}
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

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="text-sm text-zinc-600">
                Recordarme
              </label>
            </div>

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

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">
                    progress_activity
                  </span>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-symbols-outlined text-xl">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
