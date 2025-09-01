"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formSchema, FormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import { Switch } from "@/components/ui/switch";
import { useMemo } from "react";

interface FormRolProps {
  role?: {
    id: number;
    nombre: string;
    puedeAsignarEstablecimientos?: boolean;
    requiereEstablecimientos?: boolean;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormRole({ role, onSuccess, onClose }: FormRolProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: role?.nombre || "",
      puedeAsignarEstablecimientos: role?.puedeAsignarEstablecimientos ?? false,
      requiereEstablecimientos: role?.requiereEstablecimientos ?? false,
    },
    mode: "onChange",
  });
  const isEdit = !!role;
  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/api/roles/${role.id}`, values);
      } else {
        await axiosInstance.post("/api/roles", values);
        toast.success(formatApiMessage("success.roleCreated"));
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(formatMessage(msg));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre del Rol"
            placeholder="Ej: ADMINISTRADOR"
            uppercase
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Puede asignar establecimientos */}
          <FormField
            control={form.control}
            name="puedeAsignarEstablecimientos"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <FormLabel>Puede asignar establecimientos</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Habilita el selector de escuelas en el formulario de usuarios.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v)}
                    disabled={form.watch("requiereEstablecimientos")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Requiere establecimientos */}
          <FormField
            control={form.control}
            name="requiereEstablecimientos"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <FormLabel>Requiere establecimientos</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Obliga a asignar al menos una escuela (útil para autoridades de mesa).
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(v) => field.onChange(v)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <SubmitButton          
            loading={isSubmitting}             
            disabled={!isValid || isSubmitting}  
            label={role ? "Actualizar" : "Crear"}
            icon={role ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
