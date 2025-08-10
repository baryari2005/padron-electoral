import { useEffect } from "react";

/** Hook SSE para cambios en vivo */
export function useVoteStream(mesaId?: string, onUpdate?: (payload: any) => void) {
  useEffect(() => {
    if (!mesaId) return;
    const es = new EventSource(`/api/electoral-rolls/stream?mesaId=${mesaId}`);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onUpdate?.(data);
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [mesaId, onUpdate]);
}
