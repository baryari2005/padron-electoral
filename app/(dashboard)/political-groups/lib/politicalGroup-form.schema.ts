import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const politicalGroupFormSchema = z.object({
  nombre: z
    .string()
    .min(4, formatMessage("Debe tener al menos 4 caracteres"))
    .max(40, formatMessage("Debe tener como máximo 40 caracteres")),
  profileImage: z.string().optional(),
  numero: z.coerce.number({
    required_error: formatMessage("El número es obligatorio"),
    invalid_type_error: formatMessage("Debe ser un número válido"),
  })
    .int(formatMessage("Debe ser un número entero"))
    .min(1, formatMessage("Debe ser mayor a 0")),
  color_hex: z.string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, formatMessage("Color HEX inválido"))
    .default("#2D3135"),
  cargoIds: z.array(z.number()).default([]),
});

export type PoliticalGroupFormValues = z.infer<typeof politicalGroupFormSchema>;