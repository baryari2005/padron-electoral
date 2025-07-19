"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import {
  FormAvatarUploader,
  FormSelectField,
  FormTextField,
  SubmitButton,
} from "@/app/(dashboard)/components/FormsCreate";

const getFormSchema = (isEdit: boolean) =>
  z.object({
    id: isEdit
      ? z.coerce.number().min(1, "Seleccioná un id de establecimiento")
      : z.any().optional(),
    nombre: z.string().min(6, "Debe tener al menos 6 caracteres"),
    direccion: z.string().min(6, "Debe tener al menos 6 caracteres"),
    profileImage: z.string().optional(),
    circuitoId: z.coerce.number().min(1, "Seleccioná un Circuito"), // ← cambiado a string
  });

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface FormEstablishmentProps {
  establishment?: {
    nombre: string;
    direccion: string;
    profileImage: string;
    id: number;
    circuitoId: number;
  };
  onSuccess: () => void;
  onClose?: () => void;
  circuites: { id: number; nombre: string; codigo: string }[];
  loadingCircuites: boolean;
}

export function FormEstablishment({
  establishment,
  onSuccess,
  onClose,
  circuites,
  loadingCircuites,
}: FormEstablishmentProps) {
  const isEdit = !!establishment;
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema(isEdit)),
    defaultValues: {
      nombre: establishment?.nombre || "",
      direccion: establishment?.direccion || "",
      id: establishment?.id ?? undefined,
      profileImage: establishment?.profileImage || "",
      circuitoId: establishment?.circuitoId ?? 0
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        circuitId: Number(values.circuitoId), // ← opcional: convertir de nuevo a número si backend lo espera así
      };

      if (isEdit) {
        await axiosInstance.put(`/api/establishments/${establishment.id}`, payload);
        toast.success("Establecimiento actualizado correctamente");
      } else {
        await axiosInstance.post("/api/establishments", payload);
        toast.success("Establecimiento creado correctamente");
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(msg);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre"
            placeholder="Nombre..."
            uppercase
          />
          <FormTextField
            control={form.control}
            name="direccion"
            label="Dirección"
            placeholder="Dirección..."
            uppercase
          />

          <FormSelectField
            control={form.control}
            name="circuitoId"
            label="Circuito"
            options={circuites.map((circuite) => ({
              value: String(circuite.id),
              label: circuite.nombre,
            }))}
            loading={loadingCircuites}
          />

          <FormAvatarUploader
            name={form.watch("nombre")}
            avatarUrl={form.watch("profileImage")}
            onAvatarUploaded={(url) =>
              form.setValue("profileImage", url, { shouldValidate: true })
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
