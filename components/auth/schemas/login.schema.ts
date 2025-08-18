import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, formatMessage("El usuario o email es requerido")),
  password: z.string().min(1, formatMessage("La contraseña es requerida")),
});

export type LoginValues = z.infer<typeof loginSchema>;
