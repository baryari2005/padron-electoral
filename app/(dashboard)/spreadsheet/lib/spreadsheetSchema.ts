import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const spreadsheetFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(40, formatMessage("Debe tener como máximo 40 caracteres"))
    .transform((val) => val.toUpperCase()),  
  numero: z
    .coerce.number({
    required_error: formatMessage("El número es obligatorio"),
    invalid_type_error: formatMessage("Debe ser un número válido"),
  })
    .int(formatMessage("Debe ser un número entero"))
    .min(1, formatMessage("Debe ser mayor a 0")),  
});

export type SpreadsheetFormValues = z.infer<typeof spreadsheetFormSchema>;