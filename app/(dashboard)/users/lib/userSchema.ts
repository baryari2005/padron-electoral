import { formatMessage } from "@/lib/utils/formatters";
import { z } from "zod";
import { _email } from "zod/v4/core";

export const userSchema = (isEdit: boolean) =>
  z.object({
    id: isEdit
      ? z.string().min(1, formatMessage("ID es obligatorio"))
      : z.any().optional(),
    userId: z.string().min(2, formatMessage("Usuario es obligatorio.")),
    nombre: z.string().min(6, formatMessage("Nombre es obligatorio.")),
    apellido: z.string().min(6, formatMessage("Apellido es obligatorio.")),
    email: z.string().min(1, formatMessage("Email es obligatorio")).email(formatMessage("Email inválido")),
    password: isEdit
      ? z.string().optional()
      : z.string().min(6, formatMessage("La contraseña debe tener al menos 6 caracteres")),
    rolId: z.coerce.number().min(1, formatMessage("Rol es obligatorio")),
    avatarUrl: z.string().optional(),
  });

export type FormValues = z.infer<ReturnType<typeof userSchema>>;