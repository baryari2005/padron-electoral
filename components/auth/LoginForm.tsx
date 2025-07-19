"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Logo } from "../Logo";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
  try {
    const { data } = await axiosInstance.post("/api/auth/login", {
      identifier,
      password,
    });

    if (data?.token) {
      localStorage.setItem("token", data.token);
      toast.success("Sesión iniciada correctamente");
      router.push("/");
    } else {
      toast.error("No se recibió un token válido.");
    }
  } catch (error: any) {    
    const msg = error.response?.data?.error || "Error al iniciar sesión";
    toast.error(msg);
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
          <h1 className="text-3xl my-2 font-bold">Bienvenido al dashboard de votaciones 2025</h1>
          <h2 className="text-2xl mb-3 text-muted-foreground">Votaciones 2025</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-full">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">Iniciar sesión</h1>
            <p className="text-muted-foreground">Ingresá tus credenciales para acceder a tu cuenta</p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault(); // ✅ previene recarga de la página
              handleLogin();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Usuario o Correo electrónico</Label>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Recordarme</Label>
              </div>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" className="w-full">
              Iniciar sesión
            </Button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">
                {error}
              </p>
            )}
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">O Crear cuenta</span>
            </div>
          </div>

          <div className="relative text-center">
            <span className="text-sm text-muted-foreground">
              ¿No tenés una cuenta?{" "}
              <Link href="/sign-up" className="text-primary-500 hover:text-primary-600 font-medium">
                Registrarse
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
