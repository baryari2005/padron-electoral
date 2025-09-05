'use client'

import { sortableHeader } from "@/app/(dashboard)/components/table/SortableHeader";
import { buildActionsColumn } from "@/app/(dashboard)/utils/buildActionsColumn";
import type { Rol } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";

type ToggleField = "puedeAsignarEstablecimientos" | "requiereEstablecimientos";

interface ColumnsProps {
  onDeleted?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  /** Si lo pasás, habilita el Switch y persiste el cambio */
  onToggle?: (id: Rol["id"], field: ToggleField, value: boolean) => void | Promise<void>;
}

export const columns = ({ onDeleted, canEdit, canDelete, onToggle }: ColumnsProps): ColumnDef<Rol>[] => {
  const booleanSwitchCol = (key: ToggleField, label: string): ColumnDef<Rol> => ({
    accessorKey: key,
    header: sortableHeader(label),
    enableSorting: true,
    cell: ({ row }) => {
      const v = row.original[key] as boolean;
      const id = row.original.id;
      const enabled = !!onToggle && !!canEdit;

      return (
        <div className="flex justify-left ml-6">
          <Switch
            checked={v}
            disabled={!enabled}
            onCheckedChange={(val) => enabled && onToggle!(id, key, val)}
            aria-label={label}
          />
        </div>
      );
    },
  });

  return [
    { accessorKey: "nombre", header: sortableHeader("Rol") },
    booleanSwitchCol("puedeAsignarEstablecimientos", "Puede asignar est."),
    booleanSwitchCol("requiereEstablecimientos", "Requiere est."),
    buildActionsColumn({ component: "roles", label: "rol", onDeleted, canEdit, canDelete }),
  ];
};
