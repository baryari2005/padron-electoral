"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "../Logo";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { formatMessage } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { setToken } = useAuthStore();

  const handleLogin = async () => {
    try {
      const { data } = await axiosInstance.post("/api/auth/login", {
        identifier,
        password,
      });

      if (data?.token) {
        const token = data.token;

        localStorage.setItem("token", token);
        setToken(token);

        // ✅ Llama al store para hidratar el usuario
        useAuthStore.setState({ loading: true }); // por si querés mostrar loading en otro lado
        await useAuthStore.getState().fetchUser();

        toast.success(formatMessage("Sesión iniciada correctamente"));
        router.push("/");
      } else {
        toast.error(formatMessage("No se recibió un token válido"));
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al iniciar sesión";
      toast.error(formatMessage(msg));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center space-y-6"
      >
        <Logo />
        <div className="text-center">
          <h1 className="text-3xl my-2 font-bold">
            {formatMessage("bienvenido al dashboard de votaciones 2025")}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-full">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              {formatMessage("Iniciar sesión")}
            </h1>
            <p className="text-muted-foreground">
              {formatMessage("Ingresá tus credenciales para acceder a tu cuenta")}
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuario o Correo electrónico</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="user123 o test@ejemplo.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
