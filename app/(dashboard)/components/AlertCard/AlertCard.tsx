// components/AlertCard.tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  tipo: "info" | "warning" | "success" | "error";
  mensaje: string;
  icon?: LucideIcon;
}

const tipoColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export function AlertCard({ tipo, mensaje, icon: Icon }: AlertCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-md border",
        tipoColors[tipo]
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span className="text-sm font-medium">{mensaje}</span>
    </div>
  );
}