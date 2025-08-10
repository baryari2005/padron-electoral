"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormAvatarUploader, FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { FormValues, userSchema } from "../../lib/userSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { Rol, Usuario } from "@prisma/client";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";

interface FormUserProps {
  user?: Usuario;
  onSuccess: () => void;
  onClose?: () => void;
  roles: Rol[];
}

export function FormUser({ user, onSuccess, onClose, roles = [] }: FormUserProps) {
  const isEdit = !!user;
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(userSchema(isEdit)),
    defaultValues: {
      id: user?.id ?? undefined,
      email: user?.email || "",
      password: "",
      avatarUrl: user?.avatarUrl || "",
      apellido: user?.apellido || "",
      nombre: user?.nombre || "",
      userId: user?.userId || "",
      rolId: user?.rolId || 0,
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const name = form.watch("nombre");
  const lastName = form.watch("apellido");

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values };

      if (isEdit) {
        await axiosInstance.put(`/api/users/${user!.id}`, payload);
      } else {
        await axiosInstance.post("/api/users", payload);
        toast.success(formatApiMessage("success.usersCreated"));
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.includes("Unique constraint failed on the fields: (`email`)")
        ? "El correo electrónico ya está en uso."
        : "Algo salió mal.";
      toast.error(formatMessage(msg));
    }
  };

  // Autogenera avatar si el usuario no subió uno propio
  useEffect(() => {
    const fullName = `${name} ${lastName}`.trim();
    const currentAvatar = form.getValues("avatarUrl");
    const isCustomAvatar = currentAvatar && !currentAvatar.includes("ui-avatars.com");

    if (fullName && !isCustomAvatar) {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName
      )}&background=404040&color=fff&size=128&rounded=true&bold=true`;
      form.setValue("avatarUrl", avatarUrl, { shouldValidate: true });
    }
  }, [name, lastName, form]); // ← incluir 'form' evita el warning

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isEdit && (
            <FormTextField control={form.control} name="userId" label="User Id" placeholder="id..." />
          )}

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

          <FormTextField control={form.control} name="nombre" label="Nombre" placeholder="Nombre..." uppercase />
          <FormTextField control={form.control} name="apellido" label="Apellido" placeholder="Apellido..." uppercase />

          <FormField
            control={form.control}
            name="rolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((rol) => (
                      <SelectItem key={rol.id} value={String(rol.id)}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
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
                    <Input
                      placeholder="Contraseña..."
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <Eye className={showPassword ? "hidden" : ""} size={20} />
                      <EyeOff className={showPassword ? "" : "hidden"} size={20} />
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormAvatarUploader
            name={form.watch("nombre")}
            avatarUrl={form.watch("avatarUrl")}
            onAvatarUploaded={(url) => form.setValue("avatarUrl", url, { shouldValidate: true })}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting || isUploading}
            label={isEdit ? "Actualizar" : "Crear"}
            icon={isEdit ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
