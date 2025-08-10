import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const categoryFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(20, formatMessage("Debe tener como máximo 20 caracteres"))
    .transform((val) => val.toUpperCase()),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;