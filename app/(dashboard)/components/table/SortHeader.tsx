// app/(dashboard)/components/table/SortHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils"; // si no tenés cn, podés omitirlo

type Props<TData> = {
  column: Column<TData, unknown>;
  label: string;
  className?: string;
  align?: "left" | "center" | "right";
};

export function SortHeader<TData>({ column, label, className, align = "left" }: Props<TData>) {
  const isSorted = column.getIsSorted(); // "asc" | "desc" | false

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting()}
      className={cn(
        "px-0 font-normal",
        isSorted && "font-semibold",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        className
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span className={isSorted ? "font-semibold" : "font-normal"}>{label}</span>
        {/* ancho fijo para evitar “saltos” al cambiar icono */}
        <span className="inline-block w-4 h-4">
          {isSorted === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : isSorted === "desc" ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ArrowUpDown className="w-4 h-4 opacity-60" />
          )}
        </span>
      </span>
    </Button>
  );
}
