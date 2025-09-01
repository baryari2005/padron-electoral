"use client";


import { useEffect, useState } from "react";
import { fetchPoliticalGroupCargoIds } from "../services/politicalGroups.service";


export function useGroupCargoIds(groupId?: number) {
    const [ids, setIds] = useState<number[] | null>(null);


    useEffect(() => {
        if (!groupId) return;
        let mounted = true;
        (async () => {
            try {
                const fetched = await fetchPoliticalGroupCargoIds(groupId);
                if (!mounted) return;
                setIds(fetched);
            } catch (e) {
                setIds([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [groupId]);


    return ids; // null = aún cargando / no solicitados
}