// src/features/users/hooks/useRoleFlags.ts
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axios";
import type { Rol } from "@prisma/client";

type RoleFlags = { puedeAsignar: boolean; requiereEscuela: boolean };
export function useRoleFlags(rolId: number | string | undefined, roles: Rol[]) {
  const [flags, setFlags] = useState<RoleFlags>({ puedeAsignar: false, requiereEscuela: false });

  const rolActual = useMemo(
    () => roles.find(r => Number(r.id) === Number(rolId)) ?? null,
    [roles, rolId]
  );

  const pAE = (rolActual as any)?.puedeAsignarEstablecimientos;
  const rE = (rolActual as any)?.requiereEstablecimientos;
  const hasFlagsInList = typeof pAE === "boolean" && typeof rE === "boolean";

  useEffect(() => {
    if (hasFlagsInList || !rolId) {
      if (hasFlagsInList) setFlags({ puedeAsignar: !!pAE, requiereEscuela: !!rE });
      return;
    }
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/roles/${rolId}`);
        setFlags({
          puedeAsignar: !!data?.puedeAsignarEstablecimientos,
          requiereEscuela: !!data?.requiereEstablecimientos,
        });
      } catch {
        try {
          const { data } = await axiosInstance.get(`/api/roles`);
          const list = Array.isArray(data) ? data : data?.items;
          const found = list?.find((r: any) => Number(r.id) === Number(rolId));
          setFlags({
            puedeAsignar: !!found?.puedeAsignarEstablecimientos,
            requiereEscuela: !!found?.requiereEstablecimientos,
          });
        } catch {
          setFlags({ puedeAsignar: false, requiereEscuela: false });
        }
      }
    })();
  }, [rolId, hasFlagsInList, pAE, rE]);

  return { ...flags };
}
