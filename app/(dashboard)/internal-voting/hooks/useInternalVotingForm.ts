import { useForm } from "react-hook-form";
import { InternalVotingFormValues } from "../components/types";

export function useInternalVotingForm() {
  const form = useForm<InternalVotingFormValues>({
        defaultValues: {
            establecimientoId: "",
            mesaId: "",
            query: "",
            groupBy: "referente",
            referenteId: "",
            planilleroId: "",
        },
    });

  const values = {
    establecimientoId: form.watch("establecimientoId"),
    mesaId: form.watch("mesaId"),
    query: form.watch("query"),
    groupBy: form.watch("groupBy"),
    referenteId: form.watch("referenteId"),
    planilleroId: form.watch("planilleroId"),
  };

  return {
    form,
    values,
  };
}