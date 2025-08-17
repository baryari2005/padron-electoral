// components/AlertCard/AlertCard.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

// Variantes nuevas
type Variant = "default" | "info" | "success" | "warning" | "destructive";
// Compat con tu API anterior
type LegacyTipo = "info" | "warning" | "success" | "error";

export type AlertCardProps = {
  variant?: Variant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  action?: React.ReactNode;
  onClose?: () => void;
  className?: string;

  // 🔙 Compatibilidad con el componente viejo
  tipo?: LegacyTipo;
  mensaje?: string;
};

const variantStyles: Record<Variant, string> = {
  default:
    "border-border bg-muted text-foreground",
  info:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  success:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  warning:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  destructive:
    "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
};

const defaultIcons: Record<Variant, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertOctagon,
};

export function AlertCard(props: AlertCardProps) {
  // Resolver variante (nueva API o legacy)
  const resolvedVariant: Variant =
    props.variant ??
    (props.tipo
      ? (props.tipo === "error" ? "destructive" : (props.tipo as Variant))
      : "default");

  // Resolver título/descripcion (nueva API o legacy)
  const title =
    props.title ?? (props.mensaje ? String(props.mensaje) : undefined);
  const description = props.description;

  const Icon = props.icon ?? defaultIcons[resolvedVariant];

  const role =
    resolvedVariant === "destructive" || resolvedVariant === "warning"
      ? "alert"
      : "status";

  return (
    <div
      role={role}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4",
        variantStyles[resolvedVariant],
        props.className
      )}
    >
      {/* Icono */}
      <div className="mt-0.5 shrink-0">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Contenido */}
      <div className="flex-1 space-y-1">
        {title ? (
          <div className="font-semibold leading-none">{title}</div>
        ) : null}
        {description ? (
          <div className="text-sm/6 opacity-90">{description}</div>
        ) : null}
      </div>

      {/* Acción opcional (botón Reintentar, etc.) */}
      {props.action ? (
        <div className="ml-2 shrink-0">{props.action}</div>
      ) : null}

      {/* Botón cerrar opcional */}
      {props.onClose ? (
        <button
          type="button"
          onClick={props.onClose}
          aria-label="Cerrar alerta"
          className="ml-1 rounded-md p-1 hover:bg-background/40 focus:outline-none focus:ring-2 focus:ring-ring/60"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
