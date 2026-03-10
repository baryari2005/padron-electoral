import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GroupSummary } from "../components/types";
import { getInternalVotingSummary } from "../services/internalVoting.service";

type Props = {
  canView: boolean;
  canSearch: boolean;
  establecimientoId: string;
  mesaId: string;
  referenteId: string;
  planilleroId: string;
  groupBy: string;
  query: string;
  refreshToken: number;
};

export function useInternalVotingSummary({
  canView,
  canSearch,
  establecimientoId,
  mesaId,
  referenteId,
  planilleroId,
  groupBy,
  query,
  refreshToken,
}: Props) {
  const [summaryItems, setSummaryItems] = useState<GroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

useEffect(() => {
    if (!canView || !canSearch) {
      setSummaryItems([]);
      setSelectedGroupId("");
      return;
    }

    (async () => {
      try {
        setLoadingSummary(true);

        const items = await getInternalVotingSummary({
          establecimientoId: establecimientoId || undefined,
          mesaId: mesaId || undefined,
          referenteId: referenteId || undefined,
          planilleroId: planilleroId || undefined,
          groupBy,
          q: query?.trim() || undefined,
        });

        setSummaryItems(items);

        if (items.length > 0) {
          setSelectedGroupId((prev) =>
            prev && items.some((x) => x.id === prev) ? prev : items[0].id
          );
        } else {
          setSelectedGroupId("");
        }
      } catch (error) {
        console.error(error);
        toast.error("No se pudo cargar el resumen");
        setSummaryItems([]);
        setSelectedGroupId("");
      } finally {
        setLoadingSummary(false);
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
    query,
    refreshToken,
  ]);

  return {
    summaryItems,
    selectedGroupId,
    setSelectedGroupId,
    loadingSummary,
  };
}