"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginValues } from "../schemas/login.schema";
import { login } from "../services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatMessage } from "@/lib/utils/formatters";

export function useLoginForm() {
  const router = useRouter();
  const { setToken } = useAuthStore();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { identifier: "", password: "" },
    criteriaMode: "firstError",
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const data = await login(values);
      const token = data?.token;

      if (!token) {
        toast.error(formatMessage("No se recibió un token válido"));
        return;
      }

      localStorage.setItem("token", token);
      setToken(token);

      useAuthStore.setState({ loading: true });
      await useAuthStore.getState().fetchUser();

      toast.success(formatMessage("Sesión iniciada correctamente"));
      router.push("/");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Error al iniciar sesión";
      toast.error(formatMessage(msg));
    } finally {
      useAuthStore.setState({ loading: false });
    }
  };

  return { form, onSubmit };
}
