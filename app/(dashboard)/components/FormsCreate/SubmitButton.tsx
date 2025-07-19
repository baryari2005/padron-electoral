import { Button } from "@/components/ui/button";
import { CirclePlus, Loader2, Pencil } from "lucide-react";

interface Props {
  loading: boolean;
  label?: string;
  icon?: "plus" | "save" | "pencil";
}

export function SubmitButton({ loading, label = "Guardar", icon = "save" }: Props) {
  return (
    <Button type="submit" disabled={loading} className="w-full my-2">
      {loading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" /> Procesando...
        </>
      ) : (
        <>
          {icon === "plus" && <CirclePlus className="w-4 h-4 mr-2" /> || 
          icon === "pencil" && <Pencil className="w-4 h-4 mr-2" />}
          {label}
        </>
      )}
    </Button>
  );
}
