"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormCombobox, FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";

import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import { permissionFormSchema, PermissionFormValues } from "../../lib";
import { ACCION_LABELS, ACCIONES, MODULO_LABELS, MODULOS, type Accion, type Modulo } from "@/utils/permissions";
import { useEffect, useState } from "react";

interface PermissionsKeyFormProps {
  permission?: {
    id: number;
    clave: string;
    descripcion: string;
    modulo: Modulo;
    accion: Accion;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function PermissionsKeyForm({
  permission,
  onSuccess,
  onClose }:
  PermissionsKeyFormProps) {

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      clave: permission?.clave || "",
      descripcion: permission?.descripcion || "",
      accion: ACCIONES.includes(permission?.accion as any)
        ? (permission?.accion as Accion)
        : "ver",
      modulo: MODULOS.includes(permission?.modulo as any)
        ? (permission?.modulo as Modulo)
        : "usuarios",
    },
    mode: "onChange",
  });


  const { watch, setValue } = form;

  const accion = watch("accion");
  const modulo = watch("modulo");

  useEffect(() => {
    if (accion && modulo) {
      const nuevaClave = `${accion}_${modulo}`;
      setValue("clave", nuevaClave, { shouldValidate: true });
      setValue("descripcion", `Puede ${accion} ${modulo}`)

    }
  }, [accion, modulo, setValue]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: PermissionFormValues) => {
    try {
      if (permission) {
        await axiosInstance.put(`/api/permissions/keys/${permission.id}`, values);
      } else {
        await axiosInstance.post("/api/permissions/keys", values);
        toast.success(formatApiMessage("success.permissionsCreated"));
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
            name="clave"
            label="clave"
            placeholder="Ej: ver_usuarios"
            disabled
          />
          <FormTextField
            control={form.control}
            name="descripcion"
            label="Descripción"
            placeholder="Ej: Puede ver usuarios"
            disabled
            uppercase
          />

          <FormField
            control={form.control}
            name="modulo"
            render={({ field }) => (
              <FormCombobox
                label="Módulo"
                value={String(field.value)}
                onChange={field.onChange}
                options={[...MODULOS]}
                getOptionLabel={(m) => MODULO_LABELS[m]}
                getOptionValue={(m) => m}
              />
            )}
          />

          <FormField
            control={form.control}
            name="accion"
            render={({ field }) => (
              <FormCombobox
                label="Acción"
                value={String(field.value)}
                onChange={field.onChange}
                options={[...ACCIONES]}
                getOptionLabel={(a) => ACCION_LABELS[a]}
                getOptionValue={(a) => a}
              />
            )}
          />

        </div>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting}
            label={permission ? "Actualizar" : "Crear"}
            icon={permission ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
