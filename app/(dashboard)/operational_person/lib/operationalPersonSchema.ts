import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const operationalPersonFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(40, formatMessage("Debe tener como máximo 40 caracteres"))
    .transform((val) => val.toUpperCase()),
  telefono: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(val),
      {
        message: formatMessage("Formato de teléfono inválido"),
      }
    )
    .transform((val) => (val ? val.toUpperCase() : undefined)),
  tipo: z.enum(["REFERENTE", "PLANILLERO", "CHOFER"], {
    errorMap: () => ({
      message: formatMessage("Tipo de elección inválido")
    })
  }),
});

export type OperationalPersonFormValues = z.infer<typeof operationalPersonFormSchema>;