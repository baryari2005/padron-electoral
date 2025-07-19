"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { FormAvatarUploader, FormPasswordField, FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";


const formSchema = z.object({
  name: z.string().min(6, "El nombre debe tener al menos 6 caracteres"),
  lastName: z.string().min(6, "El apellido debe tener al menos 6 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

type Role = {
  id: number;
  name: string;
};

type User = {
  id: string;
  name?: string;
  lastName?: string;
  email: string;
  userId: string;
  avatarUrl?: string;
  role: Role;
  roleId: number;
  createdAt: string;
  updatedAt: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      password: "",
    },
    mode: "onChange",
  });

  const { setValue, handleSubmit, formState: { isSubmitting } } = form;

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setValue("name", data.user.name || "");
        setValue("lastName", data.user.lastName || "");
        setValue("password", "");
      });
  }, [token, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    const data = {
      id: user.id,
      email: user.email,
      name: values.name,
      lastName: values.lastName,
      password: values.password,
      avatarUrl: user.avatarUrl,
    };

    const res = await fetch("/api/auth/register", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    const resp = await res.json();

    if (res.ok) {
      toast.success("Usuario actualizado exitosamente. Redirigiendo al login...");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/sign-in";
      }, 2000);
    } else {
      toast.error(resp.error || "Error al actualizar usuario");
    }
  };

  if (!user) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Configuración de perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Podés actualizar tu nombre, apellido y avatar.</CardDescription>
        </CardHeader>
       
        <CardContent className="space-y-8">
          <FormAvatarUploader
            name={user.name || ""}
            avatarUrl={user.avatarUrl}
            onAvatarUploaded={(url) =>
              setUser((prev) => (prev ? { ...prev, avatarUrl: url } : null))
            }
          />

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormTextField
                control={form.control}
                name="name"
                label="Nombre"
                placeholder="Tu nombre..."
              />
              <FormTextField
                control={form.control}
                name="lastName"
                label="Apellido"
                placeholder="Tu apellido..."
              />
              <FormPasswordField
                control={form.control}
                name="password"
                label="Contraseña"
                placeholder="Nueva contraseña..."
              />
              <SubmitButton
                loading={isSubmitting}
                label="Guardar cambios"
                icon="save"
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del usuario</CardTitle>
          <CardDescription>Estos campos no pueden ser modificados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Rol:</strong> {user.role?.name}</p>
          <p><strong>Fecha de creación:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          <p><strong>Última actualización:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
