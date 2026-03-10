"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function AuthRehydrationProvider() {
  const { loading, hasHydrated } = useAuthStore(); // usamos loading del store central
  const pathname = usePathname();

  const year = new Date().getFullYear();

  const isLoginPage = pathname === "/sign-in";

  if (!hasHydrated || (loading && !isLoginPage)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background text-foreground">
        <div className="relative w-[60px] h-[60px] mb-2">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            sizes="160px"
            className="object-contain dark:hidden rounded-lg"            
          />
          <Image
            src="/logo-white.png"
            alt="Logo blanco"
            sizes="160px"
            fill
            className="object-contain hidden dark:block rounded-lg"            
          />
        </div>

        <h1 className="text-2xl font-bold">Elecciones Generales</h1>
        <p className="text-muted-foreground">San Miguel {year}</p>
        <hr className="w-1/4 border-muted my-6" />
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-lg font-medium text-muted-foreground animate-pulse">
            Cargando sesión...
          </span>
        </div>
      </div>
    );
  }

  return null;
}
