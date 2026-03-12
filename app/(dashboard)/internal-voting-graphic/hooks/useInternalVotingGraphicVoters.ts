import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InternalGraphicVoter } from "../components/types";
import { getInternalVotingGraphicVoters } from "../services/internalVotingGraphic.service";

type Props = {
    canView: boolean;
    referenteId: string;
    planilleroId: string;
    planillaId: string;
    query: string;
    refreshToken: number;
};

export function useInternalVotingGraphicVoters({
    canView,
    referenteId,
    planilleroId,
    planillaId,
    query,
    refreshToken,
}: Props) {
    const [voters, setVoters] = useState<InternalGraphicVoter[]>([]);
    const [loadingVoters, setLoadingVoters] = useState(false);
    const hasAnchorFilter =
        Boolean(referenteId) ||
        Boolean(planilleroId) ||
        Boolean(planillaId) ||
        (query?.trim().length ?? 0) >= 3;

    useEffect(() => {
        if (!canView || !hasAnchorFilter) {
            setVoters([]);
            return;
        }

        (async () => {
            try {
                setLoadingVoters(true);

                const items = await getInternalVotingGraphicVoters({
                    referenteId: referenteId || undefined,
                    planilleroId: planilleroId || undefined,
                    planillaId: planillaId || undefined,
                    q: query?.trim() || undefined,
                });

                setVoters(items);
            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar los votantes");
                setVoters([]);
            } finally {
                setLoadingVoters(false);
            }
        })();
    }, [canView, hasAnchorFilter, referenteId, planilleroId, planillaId, query, refreshToken]);

    return {
        voters,
        loadingVoters,
    };
}