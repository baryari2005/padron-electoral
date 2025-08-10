// hooks/useAuth.ts
"use client";

import { useAuthStore } from "@/stores/useAuthStore";

export function useAuth() {
  const { user, loading } = useAuthStore();

  const role = user?.rol?.nombre ?? "";

  const isAdmin = role === "ADMINISTRADOR";
  const isUsuario = role === "USUARIO";
  const isMesa = role === "AUTORIDAD DE MESA";

  return { user, loading, isAdmin, isUsuario, isMesa };
}
