import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";

type Accion = "ver" | "crear" | "editar" | "eliminar";

export type Permiso = {
  id: number;
  clave: string;
};

export type PermisoRow = {
  modulo: string;
  ver?: Permiso;
  crear?: Permiso;
  editar?: Permiso;
  eliminar?: Permiso;
};

export function buildPermissionsColumns(
  permisosSeleccionados: number[],
  togglePermiso: (id: number) => void,
  loading: boolean = false
): ColumnDef<PermisoRow>[] {
  return [
    {
      accessorKey: "modulo",
      header: "Módulo",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.original.modulo}</div>
      ),
    },
    ...(["ver", "crear", "editar", "eliminar"] as Accion[]).map((accion) => ({
      id: accion,
      header: accion.charAt(0).toUpperCase() + accion.slice(1),
      cell: ({ row }: { row: { original: PermisoRow } }) => {
        const permiso = row.original[accion];
        return permiso ? (
          <div className="flex  justify-self">
            <Switch
              checked={permisosSeleccionados.includes(permiso.id)}
              onCheckedChange={() => togglePermiso(permiso.id)}
              disabled={loading}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground"></div>
        );
      },
    })),
  ];
}
