import { z } from "zod";
import { _email } from "zod/v4/core";

export const userSchema = (isEdit: boolean) =>
  z.object({
    id: isEdit
      ? z.string().min(1, "ID es obligatorio")
      : z.any().optional(),
    userId: z.string().min(2, "Usuario es obligatorio."),
    name: z.string().min(6, "Nombre es obligatorio."),
    lastName: z.string().min(6, "Apellido es obligatorio."),
    email: z.string().min(1, "Email es obligatorio").email("Email inválido"),
    password: isEdit
      ? z.string().optional()
      : z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    roleId: z.coerce.number().min(1, "Rol es obligatorio"),
    avatarUrl: z.string().optional(),
  });

export type FormValues = z.infer<ReturnType<typeof userSchema>>;