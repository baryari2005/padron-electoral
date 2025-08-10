"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-background">
      {/* Logo con cambio según tema */}
      <div className="relative w-[60px] h-[60px] mb-2">
        <Image
          src="/logo.png"
          alt="Logo"
          fill
          className="object-contain dark:hidden"
          priority
        />
        <Image
          src="/logo-white.png"
          alt="Logo blanco"
          fill
          className="object-contain hidden dark:block"
          priority
        />
      </div>

      <h1 className="text-2xl font-bold">Votaciones 2025</h1>
      <p className="text-muted-foreground mb-4">San Miguel</p>
      <hr className="w-1/4 border-muted mb-6" />

      
      <p className="flex text-muted-foreground text-lg text-red-500 mb-6 text-center">
        <AlertTriangle size={24} className="text-red-500 mr-2" /> No tenés permiso para ver esta sección.
      </p>

      {/* <div className="flex gap-4 flex-wrap justify-center">
        <Button variant="outline" onClick={() => router.push("/")}>
          Volver al inicio
        </Button>
        <Button onClick={() => router.push("/sign-up")}>
          Iniciar sesión
        </Button>
      </div> */}
    </div>
  );
}
