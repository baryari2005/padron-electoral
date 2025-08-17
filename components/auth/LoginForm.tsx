"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

import { formatMessage } from "@/lib/utils/formatters";

import { useLoginForm } from "./hooks/useLoginForm";
import { Logo } from "../ui/Logo";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { form, onSubmit } = useLoginForm();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = form;

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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuario o Correo electrónico</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="user123 o test@ejemplo.com"
                autoComplete="username"
                {...register("identifier")}
                aria-invalid={!!errors.identifier}
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  {formatMessage("Ingresando...")}
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
