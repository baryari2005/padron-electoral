"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import {
  FormAvatarUploader,
  FormTextField,
  SubmitButton,
} from "@/app/(dashboard)/components/FormsCreate";
import { FormValues, userSchema } from "../../lib/userSchema";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { User } from "@prisma/client";



interface FormUserProps {
  user?: User;
  onSuccess: () => void;
  onClose?: () => void;
  roles: { id: number; name: string; }[];
  loadingRoles: boolean;
}

export function FormUser({
  user,
  onSuccess,
  onClose,
  roles,
  loadingRoles,
}: FormUserProps) {
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
      lastName: user?.lastName || "",
      name: user?.name || "",
      userId: user?.userId || "",
      roleId: user?.roleId || 0
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const name = form.watch("name");
  const lastName = form.watch("lastName");

  const onSubmit = async (values: FormValues) => {
    console.log("Entre");
    try {
      const payload = {
        ...values
      };

      if (isEdit) {
        await axiosInstance.put(`/api/users/${user.id}`, payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        await axiosInstance.post("/api/users", payload);
        toast.success("Usuario creado correctamente");
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.includes("Unique constraint failed on the fields: (`email`)") ?
          "El correo electrónico ya está en uso." :
          "Algo salió mal.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    console.log("Errores del formulario:", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    const fullName = `${name} ${lastName}`.trim();

    if (fullName) {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=404040&color=fff&size=128&rounded=true&bold=true`;
      form.setValue("avatarUrl", avatarUrl, { shouldValidate: true });
    }
  }, [name, lastName]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isEdit && (
            <FormTextField
              control={form.control}
              name="userId"
              label="User Id"
              placeholder="id..."
            />
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
          <FormTextField
            control={form.control}
            name="name"
            label="Nombre"
            placeholder="Nombre..."
            uppercase
          />
          <FormTextField
            control={form.control}
            name="lastName"
            label="Apellido"
            placeholder="Apellido..."
            uppercase
          />
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

          <FormAvatarUploader
            name={form.watch("name")}
            avatarUrl={form.watch("avatarUrl")}
            onAvatarUploaded={(url) =>
              form.setValue("avatarUrl", url, { shouldValidate: true })
            }
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
