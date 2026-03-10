"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Component } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // si no tenés cn, podés removerlo
import { Separator } from "../ui/separator";

type AccessDeniedPageProps = {
  fullScreen?: boolean;      // true: tapa toda la pantalla | false: tapa solo el contenedor padre (que debe ser relative)
  showActions?: boolean;     // muestra botones opcionales
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  title?: string;
  subtitle?: string;
  location?: string;         // ej: "San Miguel 2025"
  message?: string;
  className?: string;        // por si querés estilos extra
};

export function AccessDeniedForElectionPage({
  fullScreen = true,
  showActions = true,
  onPrimaryAction,
  primaryLabel = "Ir al inicio",
  onSecondaryAction,
  secondaryLabel = "Volver",
  title = "Elecciones Generales",
  subtitle = "Informe de votos totales",
  location = `San Miguel ${new Date().getFullYear()}`,
  message = "Tiene que existir una elección activa. ",
  className,
}: AccessDeniedPageProps) {
  const router = useRouter();
  const focusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Le damos foco a un botón al montar para accesibilidad / navegación con teclado
    focusRef.current?.focus();
  }, []);

  const WrapperTag = "div";
  const coverClasses = fullScreen
    ? "fixed inset-0 z-50"
    : "absolute inset-0 z-50"; // recuerda: el padre debe tener `relative` si NO es fullScreen

  return (
    <WrapperTag
      className={cn(
        coverClasses,
        "grid place-items-center bg-background/80 backdrop-blur-sm",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-label="Acceso denegado"
    >
      <div className="w-full max-w-md mx-auto text-center rounded-2xl border bg-card p-8 shadow-lg">
        {/* Logo que cambia según tema */}
        <div className="relative w-[60px] h-[60px] mx-auto mb-3">
          <Image
            src="/logo.png"
            alt="Logo"
            sizes="160px"
            fill
            className="object-contain rounded-lg dark:hidden"
            // priority
          />
          <Image
            src="/logo-white.png"
            alt="Logo blanco"
            sizes="160px"
            fill
            className="object-contain hidden rounded-lg dark:block"
            // priority
          />
        </div>

        {/* Encabezado */}

        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{location}</p>

        <hr className="my-4 border-muted/50" />

        <div className="flex items-center justify-center animate-pulse">
          <Component className="w-4 h-4 mr-2" />
          <h2 className="text-sm-plus text-muted-foreground">{subtitle}</h2>
        </div>
        {/* Mensaje de error */}
        <div className="flex items-center justify-center gap-2 text-red-600 mb-6 animate-pulse">
          <AlertTriangle className="shrink-0 " size={22} />
          <p className="text-base font-medium ">{message}</p>
        </div>

        <Separator className="mb-6" />
        {/* Acciones */}
        {showActions && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              ref={focusRef}
              onClick={
                onPrimaryAction
                  ? onPrimaryAction
                  : () => router.push("/") // acción por defecto
              }
            >
              {primaryLabel}
            </Button>

            <Button
              variant="outline"
              onClick={
                onSecondaryAction
                  ? onSecondaryAction
                  : () => router.back() // acción por defecto
              }
            >
              {secondaryLabel}
            </Button>
          </div>
        )}
      </div>
    </WrapperTag>
  );
}
