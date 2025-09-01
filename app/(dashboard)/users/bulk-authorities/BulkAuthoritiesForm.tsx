"use client";

import { useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import { useHasPermission } from "@/lib/permissions/useHasPermission";
import { AccessDeniedPage } from "@/components/NoPermissions/AccessDeniedPage";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Stats = {
  totalEscuelas: number;
  usuariosCreados: number;
  usuariosActualizados: number;
  enlacesCreados: number;
  enlacesYaExistian: number;
  errores: number;
  roleId: number;
};

export default function GenerarAutoridadesPage() {
  // si tenés un permiso específico, cambialo aquí:
  const canRun = useHasPermission("editar_generarusuario") || useHasPermission("crear_generarusuario");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetPasswords, setResetPasswords] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  if (!canRun) return <AccessDeniedPage subtitle="Generar usuarios Autoridad de mesa." />;

  const run = async () => {
    try {
      setLoading(true);
      setStats(null);
      const { data } = await axiosInstance.post("/api/users/bulk-authorities", { resetPasswords });
      if (data?.ok) {
        setStats(data.stats);
        toast.success("Usuarios generados/actualizados correctamente.");
      } else {
        toast.error(data?.error ?? "No se pudo completar la operación.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "Error al generar usuarios.");
    } finally {
      setLoading(false);
      setOpenConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Users className="h-6 w-6" />
        Generar usuarios Autoridad de mesa
      </h1>

      <Card className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">
          Crea/actualiza un usuario por cada establecimiento con:
          <ul className="list-disc ml-5 mt-1">
            <li><code>userId</code>: <em>aut</em> + <em>establecimientoId</em></li>
            <li><code>email</code>: <em>email</em> + <em>establecimientoId</em> + <em>@aut.com</em></li>
            <li><code>nombre</code>: <strong>AUTORIDAD DE MESA</strong></li>
            <li><code>apellido</code>: nombre de la escuela</li>
            <li><code>rol</code>: el rol con <code>puedeAsignarEstablecimientos = true</code> (o <code>AUTORIDAD_ROLE_ID</code>)</li>
            <li><code>contraseña</code>: <em>aut</em> + <em>establecimientoId</em> + <em>2005!</em></li>
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="reset" checked={resetPasswords} onCheckedChange={setResetPasswords} />
          <Label htmlFor="reset">Resetear contraseña si el usuario ya existe</Label>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenConfirm(true)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {loading ? "Procesando..." : "Generar usuarios"}
          </Button>
        </div>

        {stats && (
          <div className="rounded-md border p-3 text-sm">
            <div className="font-medium mb-1">Resultados</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Stat label="Escuelas totales" value={stats.totalEscuelas} />
              <Stat label="Usuarios creados" value={stats.usuariosCreados} />
              <Stat label="Usuarios actualizados" value={stats.usuariosActualizados} />
              <Stat label="Vínculos creados" value={stats.enlacesCreados} />
              <Stat label="Vínculos ya existían" value={stats.enlacesYaExistian} />
              <Stat label="Errores" value={stats.errores} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Rol utilizado: <code>#{stats.roleId}</code>
            </div>
          </div>
        )}
      </Card>

      {/* Confirmación */}
      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Generar/actualizar usuarios?</AlertDialogTitle>
            <AlertDialogDescription>
              Se procesará 1 usuario por cada establecimiento y se creará el vínculo
              correspondiente. Esta acción puede tardar algunos segundos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={run} disabled={loading}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}
