"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { formatApiMessage } from "@/lib/utils/formatters";
import { EstablecimientoConCircuito } from "../components/types";


export function useCertificadoEdicion(
  enabled: boolean,
  mesaId: number | undefined,
  opts: {
    onData: (data: any) => void;
    onMetadataLoaded?: (d: { seccion: string; circuito: string; mesa: string }) => void;
    onEscuelaSeleccionada?: (e: EstablecimientoConCircuito) => void;
  }
) {
  const [loadingCertificado, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled || !mesaId) { setLoading(false); return; }

    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/scrutiny-certificates/${mesaId}`);
        opts.onData(data);

        opts.onMetadataLoaded?.({
          seccion: "53 - San Miguel 2025",
          circuito: data.mesa.circuitoId,
          mesa: data.mesa.numeroMesa,
        });

        const escuelaId = data.mesa.escuelaId;
        if (escuelaId) {
          const est = await axiosInstance.get(`/api/establishments/${escuelaId}`);
          opts.onEscuelaSeleccionada?.(est.data);
        }
      } catch (e) {
        console.error("❌ Error al cargar certificado", e);
        toast.error(formatApiMessage("errors.certificateBadRequest"));
      } finally {
        setLoading(false);
      }
    })();
  }, [enabled, mesaId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loadingCertificado };
}
