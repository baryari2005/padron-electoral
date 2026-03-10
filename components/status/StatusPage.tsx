"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Component, Home } from "lucide-react";

type Props = {
  code: "403" | "404" | "501" | "409";
  title: string;
  description?: string;
  imageSrc: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export function StatusPage({
  code,
  title,
  description,
  imageSrc,
  primaryAction = { label: "Volver al inicio", href: "/" },
  secondaryAction,
}: Props) {
  const location = `San Miguel ${new Date().getFullYear()}`;
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-2 items-center">
        <div className="flex justify-center">
          <div className="relative w-[520px] h-[420px] md:w-[600px] md:h-[480px]">
            <Image
              src={imageSrc}
              alt={title}
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
            <div className="text-6xl font-extrabold tracking-tight text-destructive mt-2">{code}</div>
            <div className="flex items-center justify-center gap-2 text-destructive mb-4">              
              <h1 className="text-3xl font-semibold">
                {title}
              </h1>
            </div>

            {/* Descripción */}
            {description && (
              <div className="flex items-center justify-center gap-2 text-destructive mb-6">
                {/* <AlertTriangle className="w-6 h-6 mt-0" /> */}
                <p className="text-base font-medium text-center animate-pulse">
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

        {/* <div>
          <div className="text-6xl font-extrabold tracking-tight">{code}</div>
          <h1 className="mt-2 text-2xl font-semibold">{title}</h1>

          {description ? (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button>
              <Link href={primaryAction.href} className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>{primaryAction.label}</span>
              </Link>
            </Button>

            {secondaryAction ? (
              <Button asChild variant="outline">
                <Link href={secondaryAction.href}>
                  {secondaryAction.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div> */}
      </div>
    </div>
  );
}