import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const formSchema = z.object({
  nombre: z.string().min(6, formatMessage("El nombre debe tener al menos 6 caracteres")),
  apellido: z.string().min(6, formatMessage("El apellido debe tener al menos 6 caracteres")),
  password: z.string().min(6, formatMessage("La contraseña debe tener al menos 6 caracteres")),
});

export type FormValues = z.infer<typeof formSchema>;