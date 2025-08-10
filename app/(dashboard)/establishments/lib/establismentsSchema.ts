import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const getFormSchema = (isEdit: boolean) =>
  z.object({
    id: isEdit
      ? z.coerce.number().min(1, formatMessage("Seleccioná un id de establecimiento"))
      : z.any().optional(),
    nombre: z.string().min(6, formatMessage("Debe tener al menos 6 caracteres")),
    direccion: z.string().min(6, formatMessage("Debe tener al menos 6 caracteres")),
    profileImage: z.string().optional(),
    circuitoId: z.coerce.number().min(1, formatMessage("Seleccioná un Circuito")), // ← cambiado a string
    numerosDeMesa: z.array(z.number()).optional(), // o z.string().regex(/^\d+$/).transform(Number)
  });

export type FormValues = z.infer<ReturnType<typeof getFormSchema>>;