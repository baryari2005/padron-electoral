import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PersonOption, PlanillaOption } from "../components/types";
import {
  getGraphicFilterOptions,
} from "../services/internalVotingGraphic.service";

type Props = {
  canView: boolean;
  referenteId: string;
  planilleroId: string;
};

export function useInternalVotingGraphicOptions({
  canView,
  referenteId,
  planilleroId,
}: Props) {
  const [referentes, setReferentes] = useState<PersonOption[]>([]);
  const [planilleros, setPlanilleros] = useState<PersonOption[]>([]);
  const [planillas, setPlanillas] = useState<PlanillaOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (!canView) return;

    (async () => {
      try {
        setLoadingOptions(true);
        const data = await getGraphicFilterOptions({
          referenteId: referenteId || undefined,
          planilleroId: planilleroId || undefined,
        });

        setReferentes(data.referentes ?? []);
        setPlanilleros(data.planilleros ?? []);
        setPlanillas(data.planillas ?? []);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los filtros");
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, [canView, referenteId, planilleroId]);

  return {
    referentes,
    planilleros,
    planillas,
    loadingOptions,
  };
}