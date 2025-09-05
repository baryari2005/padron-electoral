// src/features/users/components/EscuelasSection.tsx
"use client";

import { EscuelasSelector } from "@/app/(dashboard)/users/components/UserForm/fields/EscuelasSelector";


type Props = {
  visible: boolean;
  value: number[];
  onChange: (ids: number[]) => void;
  required: boolean;
  escuelas: { id: number; nombre: string }[];
  loading?: boolean;
};

export function EscuelasSection({ visible, value, onChange, required, escuelas, loading }: Props) {
  if (!visible) return null;
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Escuelas asignadas</div>
        <div className="h-10 rounded-md bg-muted animate-pulse" />
        <div className="h-[180px] rounded-md bg-muted/60 animate-pulse" />
      </div>
    );
  }
  return (
    <EscuelasSelector
      label="Escuelas asignadas"
      value={value}
      onChange={onChange}
      required={required}
      escuelas={escuelas}
      loading={loading}
    />
  );
}
