"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatMessage } from "@/lib/utils/formatters";
import { buildPermissionsColumns } from "./permissionsColumns";
import { PenIcon, Loader2, Info } from "lucide-react";
import {
  GenericListWithTable,
  GenericDataTable,
} from "../../components";

type Accion = "ver" | "crear" | "editar" | "eliminar";

interface Permiso {
  id: number;
  clave: string;
}

interface PermisosPorModulo {
  modulo: string;
  acciones: Partial<Record<Accion, Permiso>>;
}

interface Rol {
  id: number;
  nombre: string;
}

export function PermisosPorRolGridForm() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolId, setRolId] = useState<number | null>(null);

  const [permisosPorModulo, setPermisosPorModulo] = useState<PermisosPorModulo[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(false);

  const [loadingRoles, setLoadingRoles] = useState(true);


  // Cargar roles y permisos disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRoles(true); // 👈 empieza carga
        const [rolesRes, permisosRes] = await Promise.all([
          axiosInstance.get("/api/roles"),
          axiosInstance.get("/api/permissions"),
        ]);
        setRoles(rolesRes.data.items);
        setPermisosPorModulo(permisosRes.data);
      } finally {
        setLoadingRoles(false); // 👈 termina carga
      }
    };
    fetchData();
  }, []);

  // Cargar permisos actuales del rol seleccionado
  useEffect(() => {
    if (!rolId) return;
    setLoading(true);
    axiosInstance
      .get(`/api/roles/${rolId}/permissions`)
      .then((res) => setPermisosSeleccionados(res.data))
      .finally(() => setLoading(false));
  }, [rolId]);

  const togglePermiso = (permisoId: number) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const guardarCambios = async () => {
    if (!rolId) return;
    setLoading(true);
    try {
      await axiosInstance.put(`/api/roles/${rolId}/permissions`, {
        permisos: permisosSeleccionados,
      });
      toast.success(formatMessage("Permisos actualizados"));
      setRefreshToken(Date.now()); // fuerza actualización
    } catch {
      toast.error(formatMessage("Error al guardar permisos"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Selector de rol */}
      <div className="w-full">
        <Select onValueChange={(v) => setRolId(Number(v))}>
          <SelectTrigger>
            {loadingRoles ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cargando roles...</span>
              </div>
            ) : (
              <SelectValue placeholder="Seleccioná un rol" />
            )}
          </SelectTrigger>
          <SelectContent>
            {roles.map((rol) => (
              <SelectItem key={rol.id} value={rol.id.toString()}>
                {rol.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spinner de carga al cambiar de rol */}
      {rolId && loading && (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          <span>Cargando permisos del rol...</span>
        </div>
      )}

      {/* Tabla de permisos por módulo */}
      {rolId && !loading && (
        <GenericListWithTable
          columns={buildPermissionsColumns(permisosSeleccionados, togglePermiso, loading)}
          externalSearch=""
          refreshToken={refreshToken}
          pageSize={1000}
          clientData={permisosPorModulo.map((fila) => ({
            modulo: fila.modulo,
            ver: fila.acciones.ver,
            crear: fila.acciones.crear,
            editar: fila.acciones.editar,
            eliminar: fila.acciones.eliminar,
          }))}
          DataTableComponent={(props) => (
            <GenericDataTable
              {...props}
              searchPlaceholder="Filtrar por módulo..."
            />
          )}
        />
      )}

      {/* Resumen total */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mr-4 -translate-y-4">
        <Info width={20} height={20} />
        <span>
          Este rol tiene actualmente <strong>{permisosSeleccionados.length}</strong> permisos asignados.
        </span>
      </div>

      <Separator />

      {/* Botón guardar */}
      {rolId && (
        <div className="w-full space-y-2">
          <Button onClick={guardarCambios} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <PenIcon className="mr-2 h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      )}
    </div>
  );
}
