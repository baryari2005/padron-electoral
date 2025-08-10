"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios"; // tu instancia de axios
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

interface Rol {
  id: string;
  nombre: string;
}

interface Permiso {
  id: string;
  clave: string;
  descripcion: string;
}

export function PermisosPorRolForm() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>("");
  const [permisosDelRol, setPermisosDelRol] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar roles y permisos al inicio
  useEffect(() => {
    const fetchData = async () => {
      const [rolesRes, permisosRes] = await Promise.all([
        axiosInstance.get("/api/roles"),
        axiosInstance.get("/api/permisos"),
      ]);

      setRoles(rolesRes.data);
      setPermisos(permisosRes.data);
    };

    fetchData();
  }, []);

  // 2. Cargar permisos del rol cuando cambia
  useEffect(() => {
    if (!rolSeleccionado) return;
    setLoading(true);

    axiosInstance
      .get(`/api/roles/${rolSeleccionado}/permisos`)
      .then((res) => {
        setPermisosDelRol(res.data.map((p: { id: string }) => p.id));
      })
      .finally(() => setLoading(false));
  }, [rolSeleccionado]);

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosDelRol((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const handleGuardar = async () => {
    try {
      await axiosInstance.put(`/api/roles/${rolSeleccionado}/permisos`, {
        permisos: permisosDelRol,
      });
      toast.success("Permisos actualizados correctamente");
    } catch (err) {
      toast.error("Error al guardar los permisos");
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold">Gestión de permisos por rol</h2>

      {/* Select de roles */}
      <Select onValueChange={setRolSeleccionado}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccioná un rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((rol) => (
            <SelectItem key={rol.id} value={rol.id}>
              {rol.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Lista de permisos */}
      {rolSeleccionado && (
        <div className="border rounded-md p-4 space-y-2 max-h-[300px] overflow-auto">
          {permisos.map((permiso) => (
            <div key={permiso.id} className="flex items-center space-x-2">
              <Checkbox
                id={permiso.id}
                checked={permisosDelRol.includes(permiso.id)}
                onCheckedChange={() => handleTogglePermiso(permiso.id)}
              />
              <Label htmlFor={permiso.id}>
                <span className="font-mono text-sm">{permiso.clave}</span> – {permiso.descripcion}
              </Label>
            </div>
          ))}
        </div>
      )}

      {rolSeleccionado && (
        <Button onClick={handleGuardar} disabled={loading}>
          Guardar cambios
        </Button>
      )}
    </div>
  );
}
