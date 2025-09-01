"use client";


import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Cargo, fetchCargos } from "../services/politicalGroups.service";


export function useCargos() {
    const [cargos, setCargos] = useState<Cargo[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const items = await fetchCargos();
                if (!mounted) return;
                setCargos(items);
            } catch (e) {
                setCargos([]);
                toast.error("No se pudieron cargar los cargos.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);


    return { cargos, loading } as const;
}