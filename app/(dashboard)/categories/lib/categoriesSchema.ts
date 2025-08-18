import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const categoryFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(40, formatMessage("Debe tener como máximo 40 caracteres"))
    .transform((val) => val.toUpperCase()),
  orden: z
    .number({ invalid_type_error: formatMessage("El orden debe ser un número") })
    .int(formatMessage("Debe ser un entero"))
    .min(1, formatMessage("El orden debe ser al menos 1"))
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;