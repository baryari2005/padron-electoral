import { GroupSummary, InternalVotingStats } from "../components/types";
import { PendingMark } from "../components/types";

export function buildInternalVotingStats(
  summaryItems: GroupSummary[],
  pendingMarks: PendingMark[]
): InternalVotingStats {
  const total = summaryItems.reduce((acc, item) => acc + item.total, 0);
  const voted = summaryItems.reduce((acc, item) => acc + item.voted, 0);
  const notVoted = summaryItems.reduce((acc, item) => acc + item.notVoted, 0);

  return {
    total,
    voted,
    notVoted,
    pending: pendingMarks.length,
  };
}