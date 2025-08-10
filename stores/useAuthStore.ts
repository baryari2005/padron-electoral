// stores/useAuthStore.ts
import axiosInstance from "@/utils/axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  userId?: string;
  avatarUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  rol: {
    id: number;
    nombre: string;
  };
  permisos: string[]; // Ej: ["usuarios.ver", "circuitos.crear"]
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hasHydrated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: true,
      hasHydrated: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, loading: false });
      },

      fetchUser: async () => {
        console.log("🔁 [ZUSTAND] Ejecutando fetchUser");
        const token = localStorage.getItem("token");
        if (!token) {
          set({ user: null, loading: false });
          return;
        }
        try {
          const res = await axiosInstance.get("/api/auth/me");
          set({ user: res.data.user, loading: false });
        } catch (error) {
          set({ user: null, loading: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // <- clave para evitar loops
      },
    }
  )
);
