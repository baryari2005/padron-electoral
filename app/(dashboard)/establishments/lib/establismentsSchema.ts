import { z } from "zod";

export const getFormSchema = (isEdit: boolean) =>
  z.object({
    id: isEdit
      ? z.coerce.number().min(1, "Seleccioná un id de establecimiento")
      : z.any().optional(),
    nombre: z.string().min(6, "Debe tener al menos 6 caracteres"),
    direccion: z.string().min(6, "Debe tener al menos 6 caracteres"),
    profileImage: z.string().optional(),
    circuitoId: z.coerce.number().min(1, "Seleccioná un Circuito"), // ← cambiado a string
  });

export type FormValues = z.infer<ReturnType<typeof getFormSchema>>;