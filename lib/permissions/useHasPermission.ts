// lib/permissions/useHasPermission.ts
import { useAuthStore } from "@/stores/useAuthStore";

export function useHasPermission(clave: string): boolean {
  const { user } = useAuthStore();
  const permisos = user?.permisos ?? [];

  return permisos.includes(clave) ?? false;
}
