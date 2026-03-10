import { Loader2 } from "lucide-react";
import Image from "next/image";

type Variant = "inline" | "container" | "page" | "fullscreen";
type LabelSize = "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl";

interface Props {
  label?: string;
  variant?: Variant;
  pageMinHeight?: string;
  className?: string;
  labelSize?: LabelSize;
}

export function CarryingSpinner({
  label = "Cargando...",
  variant = "inline",
  pageMinHeight = "80vh",
  className = "",
  labelSize = "text-lg",
}: Props) {
  const year = new Date().getFullYear();

  const base = "grid place-items-center w-full";
  const classes =
    variant === "fullscreen"
      ? `${base} fixed inset-0 min-h-screen bg-background/60 backdrop-blur-sm z-50`
      : variant === "container"
      ? `${base} h-full`
      : variant === "page"
      ? `${base} min-h-screen`
      : `${base}`;

  return (
    <div
      className={`${classes} ${className}`}
      style={variant === "page" ? { minHeight: pageMinHeight } : undefined}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-2 h-[60px] w-[60px]">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            sizes="60px"
            className="rounded-lg object-contain dark:hidden"
          />
          <Image
            src="/logo-white.png"
            alt="Logo blanco"
            fill
            sizes="60px"
            className="hidden rounded-lg object-contain dark:block"
          />
        </div>

        <h1 className="text-2xl font-bold">Elecciones Generales</h1>
        <p className="text-muted-foreground">San Miguel {year}</p>

        <hr className="my-6 w-32 border-muted" />

        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className={`${labelSize} animate-pulse font-medium text-muted-foreground`}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}