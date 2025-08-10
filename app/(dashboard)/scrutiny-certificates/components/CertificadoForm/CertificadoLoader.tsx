"use client";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export function CertificadoLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-secondary text-muted-foreground">
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
      <p className="text-muted-foreground">San Miguel</p>
      <hr className="w-1/4 border-muted my-6" />

      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="text-lg font-medium text-muted-foreground animate-pulse">
          Cargando Certificado de Escrutinio...
        </span>
      </div>
    </div>
  );
}