import { Button } from "@/components/ui/button";
import { Elector } from "./types";
import { Check, X } from "lucide-react";

/** Toggle en lote: solo UI optimista + registra pending */
export function VoteToggle({
  elector,
  onOptimistic,
}: {
  elector: Elector;
  onOptimistic: (e: Elector) => void;
}) {
  const voted = !!elector.votedAt;
  const toggle = () => {
    const optimistic: Elector = {
      ...elector,
      votedAt: voted ? null : new Date().toISOString(),
    };
    onOptimistic(optimistic);
  };

  return (
    <Button
      onClick={toggle}
      variant={voted ? "default" : "secondary"}
      className="h-8 px-3"
    >
      {voted ? (
        <span className="inline-flex items-center gap-1">
          <Check className="h-4 w-4" /> Votó
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <X className="h-4 w-4" /> Marcar
        </span>
      )}
    </Button>
  );
}