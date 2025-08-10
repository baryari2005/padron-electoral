"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import axiosInstance from "@/utils/axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from 'framer-motion';
import { Logo } from "../Logo";
import { useRouter } from "next/navigation";


interface Role {
  id: string;
  name: string;
}

const formSchema = z.object({
  userId: z.string().min(2, "Debe tener al menos 2 caracteres"),
  name: z.string().min(6, "Debe tener al menos 6 caracteres"),
  lastName: z.string().min(6, "Debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.string().min(1, "Seleccioná un rol"),
});

export default function RegisterForm() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      name: "",
      lastName: "",
      email: "",
      password: "",
      roleId: "",
    },
    mode: "onChange", // importante para validar mientras se completa
  });

  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosInstance.get("/api/roles");
        setRoles(res.data.roles);
      } catch (err) {
        toast.error("No se pudieron cargar los roles");
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        roleId: Number(values.roleId),
      };
      const res = await axiosInstance.post("/api/auth/register", payload);

      toast.success("Usuario creado correctamente");

      try {
        const { data } = await axiosInstance.post("/api/auth/login", {
          identifier: values.userId,
          password: values.password,
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

    } catch (error) {
      toast.error("Algo salió mal al registrar el usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl flex flex-col items-center space-y-6"
      >
        <Logo />

        <div className="text-center">
          <h1 className="text-3xl my-2 font-bold">Bienvenido al dashboard de votaciones 2025</h1>
          <h2 className="text-2xl mb-3 text-muted-foreground">Votaciones 2025</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 w-full">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">Crear tu cuenta</h1>

          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Id</FormLabel>
                      <FormControl>
                        <Input placeholder="Id usuario..." type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre..." type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido..." type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email..." type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 
                Debug: mostrar valor seleccionado
                <p className="text-sm text-muted-foreground">
                  Rol seleccionado: {form.watch("roleId")}
                </p> */}

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        value={String(field.value) || ""}
                        onValueChange={(value) => {
                          console.log("Rol seleccionado:", value);
                          field.onChange(value);
                        }}
                        disabled={loadingRoles}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccioná un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingRoles ? (
                            <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando roles...
                            </div>
                          ) : (
                            roles.map((role) => (
                              <SelectItem key={role.id} value={String(role.id)}>
                                {role.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Contraseña..." type={showPassword ? "text" : "password"} {...field} />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={!form.formState.isValid}>
                Crear usuario
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
