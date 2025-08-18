"use client";
import type { HeaderContext } from "@tanstack/react-table";
import { SortHeader } from "./SortHeader";

export function sortableHeader<TData>(label: string) {
  const HeaderComp = ({ column }: HeaderContext<TData, unknown>) => (
    <SortHeader<TData> column={column} label={label} />
  );

  // Para que ESLint no marque react/display-name
  HeaderComp.displayName = `SortableHeader(${label})`;

  return HeaderComp;
}