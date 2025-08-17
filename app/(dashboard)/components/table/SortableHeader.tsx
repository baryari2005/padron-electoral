// app/(dashboard)/components/table/sortableHeader.tsx
"use client";
import type { HeaderContext } from "@tanstack/react-table";
import { SortHeader } from "./SortHeader";

export function sortableHeader<TData>(label: string) {
  return ({ column }: HeaderContext<TData, unknown>) => (
    <SortHeader<TData> column={column} label={label} />
  );
}
