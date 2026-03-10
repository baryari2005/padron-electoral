import { formatMessage } from "@/lib/utils/formatters"
import { z } from "zod"

export const electionFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(40, formatMessage("Debe tener como máximo 40 caracteres"))
    .transform((val) => val.trim().toUpperCase()),

  tipo: z.enum(["GENERAL", "INTERNA"], {
    errorMap: () => ({
      message: formatMessage("Tipo de elección inválido")
    })
  }),

  fecha: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      formatMessage("Fecha inválida")
    )
})

export type ElectionFormValues = z.infer<typeof electionFormSchema>