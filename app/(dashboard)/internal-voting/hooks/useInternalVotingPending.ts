import { useMemo, useState } from "react";
import { PendingMark } from "../components/types";

export function useInternalVotingPending() {
  const [pendingMarks, setPendingMarks] = useState<PendingMark[]>([]);

  function resetPending() {
    setPendingMarks([]);
  }


  function upsertPending(electorId: string, voted: boolean) {
    setPendingMarks((prev) => {
      const idx = prev.findIndex((x) => x.electorId === electorId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { electorId, voted };
        return next;
      }
      return [...prev, { electorId, voted }];
    });
  }

  function markAllCurrentGroupAsVoted(electorIds: string[]) {
    setPendingMarks((prev) => {
      const map = new Map(prev.map((item) => [item.electorId, item.voted]));

      for (const electorId of electorIds) {
        map.set(electorId, true);
      }

      return Array.from(map.entries()).map(([electorId, voted]) => ({
        electorId,
        voted,
      }));
    });
  }

  const pendingMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of pendingMarks) {
      map.set(item.electorId, item.voted);
    }
    return map;
  }, [pendingMarks]);

  return {
    pendingMarks,
    pendingMap,
    setPendingMarks,
    resetPending,
    upsertPending,
    markAllCurrentGroupAsVoted,
  };
}