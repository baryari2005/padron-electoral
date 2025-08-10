"use client";

import { useEffect } from "react";
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

import {
  FormAvatarUploader,
  FormPasswordField,
  FormTextField,
  SubmitButton,
} from "@/app/(dashboard)/components/FormsCreate";

import { formSchema, FormValues } from "./utils/schema";
import { formatMessage } from "@/lib/utils/formatters";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      password: "",
    },
    mode: "onChange",
  });

  const { setValue, handleSubmit, formState: { isSubmitting } } = form;

  useEffect(() => {
    if (user) {
      setValue("nombre", user.nombre || "");
      setValue("apellido", user.apellido || "");
      setValue("password", "");
    }
  }, [user, setValue]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    const data = {
      id: user.id,
      email: user.email,
      name: values.nombre,
      lastName: values.apellido,
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
      toast.success(formatMessage("usuario actualizado exitosamente. redirigiendo al login"));
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/sign-in";
      }, 2000);
    } else {
      toast.error(formatMessage(resp.error || "error al actualizar usuario"));
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Cargando perfil...</p>;
  }

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-2xl mb-6">Configuración del perfil.</h2>
        </div> */}

      <Card>
        <CardHeader>
          <div className="gap flex">

            <Link href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowBigLeft className="w-5 h-5 mr-1" />
              Volver
            </Link>
            <CardTitle className="text-2xl font-semibold text-muted-foreground ml-4">Información personal</CardTitle>
          </div>
          <CardDescription>Podés actualizar tu nombre, apellido y avatar.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <FormAvatarUploader
            name={user.nombre || ""}
            avatarUrl={user.avatarUrl ?? undefined}
            onAvatarUploaded={(url) => {
              if (user) {
                setUser({ ...user, avatarUrl: url });
              }
            }}
          />

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormTextField
                control={form.control}
                name="nombre"
                label="Nombre"
                placeholder="Tu nombre..."
              />
              <FormTextField
                control={form.control}
                name="apellido"
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
          <p><strong>Rol:</strong> {user.rol?.nombre}</p>
          <p><strong>Fecha de creación:</strong> {new Date(user.createdAt).toLocaleString()}</p>
          <p><strong>Última actualización:</strong> {new Date(user.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
