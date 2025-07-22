import { z } from "zod";

export const politicalGroupFormSchema = z.object({
  nombre: z
    .string()
    .min(4, "Debe tener al menos 4 caracteres")
    .max(40, "Debe tener como máximo 40 caracteres"),
  profileImage: z.string().optional(),
  numero: z.coerce.number({
    required_error: "El número es obligatorio",
    invalid_type_error: "Debe ser un número válido",
  }),
});

export type PoliticalGroupFormValues = z.infer<typeof politicalGroupFormSchema>;