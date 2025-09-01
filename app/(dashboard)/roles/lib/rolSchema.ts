import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const formSchema = z.object({
  nombre: z.string().min(4, formatMessage("Debe tener al menos 4 caracteres")).max(20, formatMessage("Debe tener como máximo 20 caracteres")),
  puedeAsignarEstablecimientos: z.boolean(),
  requiereEstablecimientos: z.boolean(),
});

export type FormValues = z.infer<typeof formSchema>;