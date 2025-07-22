import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(4, "Debe tener al menos 4 caracteres").max(20, "Debe tener como máximo 20 caracteres"),
});

export type FormValues = z.infer<typeof formSchema>;