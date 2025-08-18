"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";

export function usePermisosMatriz(deps: { ready: boolean; eleccionId?: number }) {
  const [habilitadosPorAgrupacion, setMap] = useState<Record<number, Set<number>>>({});
  const [loadingPermisos, setLoading] = useState(true);

  useEffect(() => {
    if (!deps.ready) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const url = deps.eleccionId
          ? `/api/political-groups/permissions-matrix?eleccionId=${deps.eleccionId}`
          : "/api/political-groups/permissions-matrix";
        const { data } = await axiosInstance.get(url);
        const byGroup = data?.byGroup ?? {};
        const map: Record<number, Set<number>> = {};
        Object.keys(byGroup).forEach(k => {
          const agId = Number(k);
          map[agId] = new Set((byGroup[k] as number[]).map(Number));
        });
        if (mounted) setMap(map);
      } catch (e) {
        console.error("❌ Error cargando matriz permisos", e);
        if (mounted) setMap({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [deps.ready, deps.eleccionId]);

  return { habilitadosPorAgrupacion, loadingPermisos };
}
