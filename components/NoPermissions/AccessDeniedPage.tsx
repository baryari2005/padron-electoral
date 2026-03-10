"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Component, Home } from "lucide-react";

type Props = {
  code?: "401" | "403" | "404" | "409" | "501";
  subtitle: string;
  description?: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export function AccessDeniedPage({
  code = "401",
  subtitle,
  description = "No tenés permisos para ver esta sección.",
  primaryAction = { label: "Volver al inicio", href: "/" },
  secondaryAction,
}: Props) {
  const location = `San Miguel ${new Date().getFullYear()}`;
  const imageSrc = "/robot-ad2.png";

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid gap-12 md:grid-cols-2 items-center">

        {/* Imagen */}
        <div className="flex justify-center">
          <div className="relative w-[520px] h-[420px] md:w-[600px] md:h-[480px]">
            <Image
              src={imageSrc}
              alt={subtitle}
              fill
              className="object-contain drop-shadow-2xl animate-[float_4s_ease-in-out_infinite]"
              priority
            />
          </div>
        </div>

        {/* Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md text-center flex flex-col items-center">

            {/* Logo + Título Elecciones */}
            <div className="flex items-center justify-center gap-4 mb-6">

              <div className="relative w-[70px] h-[70px] shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain rounded-full dark:hidden"
                />
                <Image
                  src="/logo-white.png"
                  alt="Logo blanco"
                  fill
                  className="object-contain hidden rounded-full dark:block"
                />
              </div>

              <div className="text-left">
                <h2 className="text-xl font-semibold leading-tight">
                  Elecciones
                </h2>
                <h2 className="text-2xl font-bold leading-tight">
                  Generales
                </h2>
                <p className="text-muted-foreground text-sm">
                  {location}
                </p>
              </div>

            </div>

            {/* Título principal */}
            <div className="flex items-center justify-center gap-2 text-destructive mb-4">
              <Component className="w-5 h-5" />
              <h1 className="text-3xl font-semibold">
                {subtitle}
              </h1>
            </div>

            {/* Descripción */}
            {description && (
              <div className="flex items-center justify-center gap-2 text-destructive mb-6">
                <AlertTriangle size={20} />
                <p className="text-base font-medium text-center">
                  {description}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  {primaryAction.label}
                </Link>
              </Button>

              {secondaryAction && (
                <Button asChild variant="outline">
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                  </Link>
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}