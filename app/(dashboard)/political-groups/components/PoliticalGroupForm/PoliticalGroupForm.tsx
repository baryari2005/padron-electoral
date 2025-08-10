"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormAvatarUploader, FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { politicalGroupFormSchema, PoliticalGroupFormValues } from "../../lib";
import { useState } from "react";
import { formatApiMessage } from "@/lib/utils/formatters";

interface FormPoliticalGroupProps {
  politicalGroup?: {
    id: number;
    nombre: string;
    numero: number;
    profileImage: string;
  };
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormPoliticalGroup({ politicalGroup, modo = "editar", onSuccess, onClose }: FormPoliticalGroupProps) {
  const isReadOnly = modo === "ver";
  const form = useForm<PoliticalGroupFormValues>({
    resolver: zodResolver(politicalGroupFormSchema),
    defaultValues: {
      nombre: politicalGroup?.nombre || "",
      numero: politicalGroup?.numero || 0,
      profileImage: politicalGroup?.profileImage || "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (values: PoliticalGroupFormValues) => {
    try {
      if (politicalGroup) {
        await axiosInstance.put(`/api/political-groups/${politicalGroup.id}`, values);
      } else {
        await axiosInstance.post("/api/political-groups", values);
        toast.success(formatApiMessage("success.politicalGroupCreated"));
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
            name="numero"
            label="Número"
            placeholder="Ej: 132"
            uppercase
            disabled={isReadOnly}
          />
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre"
            placeholder="Ej: JUNTOS POR EL CAMBIO"
            uppercase
            disabled={isReadOnly}
          />
        </div>

        {!isReadOnly && (
          <FormAvatarUploader
            name={form.watch("nombre")}
            avatarUrl={form.watch("profileImage")}
            onAvatarUploaded={(url) =>
              form.setValue("profileImage", url, { shouldValidate: true })
            }
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        )}
        
        {!isReadOnly && (
          <div className="mt-4">
            <SubmitButton
              loading={isSubmitting || isUploading}
              label={politicalGroup ? "Actualizar" : "Crear"}
              icon={politicalGroup ? "pencil" : "plus"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}
