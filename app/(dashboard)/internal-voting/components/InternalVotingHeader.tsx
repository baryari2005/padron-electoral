import { Asterisk, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  pendingCount: number;
  canEdit: boolean;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
};

export function InternalVotingHeader({
  pendingCount,
  canEdit,
  saving,
  onDiscard,
  onSave,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl">Marcación de votantes</h2>        
          <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Asterisk className="w-4 h-4"/>
            Podés agrupar por referente, planillero, planilla u orden de padrón
            en toda la elección, o acotar por escuela y mesa si lo necesitás.
          </p>        
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onDiscard}
          disabled={!pendingCount}          
        >
          Descartar
        </Button>

        <Button
          type="button"
          onClick={onSave}
          disabled={!pendingCount || !canEdit || saving}
        >

          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="w-4 h4" />Guardar cambios {pendingCount ? `(${pendingCount})` : ""}
        </Button>
      </div>
    </div>
  );
}