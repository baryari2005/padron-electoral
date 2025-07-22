import { z } from "zod";

export const circuitFormSchema = z.object({
  nombre: z
    .string()
    .min(4, "Debe tener al menos 4 caracteres")
    .max(20, "Debe tener como máximo 20 caracteres")
    .transform((val) => val.toUpperCase()),
  codigo: z
    .string()
    .min(2, "Debe tener al menos 2 caracteres")
    .max(20, "Debe tener como máximo 20 caracteres")
    .transform((val) => val.toUpperCase()),
});

export type CircuitFormValues = z.infer<typeof circuitFormSchema>;