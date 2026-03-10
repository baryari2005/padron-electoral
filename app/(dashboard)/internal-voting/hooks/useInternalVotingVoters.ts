import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InternalVoter } from "../components/types";
import { getInternalVotingVoters } from "../services/internalVoting.service";

type Props = {
  canView: boolean;
  canSearch: boolean;
  establecimientoId: string;
  mesaId: string;
  referenteId: string;
  planilleroId: string;
  groupBy: string;
  selectedGroupId: string;
  query: string;
  refreshToken: number;
};

export function useInternalVotingVoters({
  canView,
  canSearch,
  establecimientoId,
  mesaId,
  referenteId,
  planilleroId,
  groupBy,
  selectedGroupId,
  query,
  refreshToken,
}: Props) {
  const [selectedGroupVoters, setSelectedGroupVoters] = useState<InternalVoter[]>([]);
  const [loadingVoters, setLoadingVoters] = useState(false);

  useEffect(() => {
    if (!canView || !canSearch || !selectedGroupId) {
      setSelectedGroupVoters([]);
      return;
    }

    (async () => {
      try {
        setLoadingVoters(true);

        const items = await getInternalVotingVoters({
          establecimientoId: establecimientoId || undefined,
          mesaId: mesaId || undefined,
          referenteId: referenteId || undefined,
          planilleroId: planilleroId || undefined,
          groupBy,
          groupValue: selectedGroupId,
          q: query?.trim() || undefined,
        });

        setSelectedGroupVoters(items);
      } catch (error) {
        console.error(error);
        toast.error("No se pudieron cargar los votantes del grupo");
        setSelectedGroupVoters([]);
      } finally {
        setLoadingVoters(false);
      }
    })();
  }, [
    canView,
    canSearch,
    establecimientoId,
    mesaId,
    referenteId,
    planilleroId,
    groupBy,
    selectedGroupId,
    query,
    refreshToken,
  ]);

  return {
    selectedGroupVoters,
    loadingVoters,
  };
}