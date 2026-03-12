import { useForm } from "react-hook-form";
import { GraphicFormValues } from "../components/types";

export function useInternalVotingGraphicForm() {
  const form = useForm<GraphicFormValues>({
    defaultValues: {
      referenteId: "",
      planilleroId: "",
      planillaId: "",
      query: "",
      view: "grid",
    },
  });

  const values = {
    referenteId: form.watch("referenteId"),
    planilleroId: form.watch("planilleroId"),
    planillaId: form.watch("planillaId"),
    query: form.watch("query"),
    view: form.watch("view"),
  };

  return { form, values };
}