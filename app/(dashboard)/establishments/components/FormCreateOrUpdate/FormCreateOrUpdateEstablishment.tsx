"use client";

import { useEffect, useState } from "react";
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
import { Circuito, Establecimiento } from "@prisma/client";
import { FormValues, getFormSchema } from "../../lib";

interface FormEstablishmentProps {
  establishment?: Establecimiento;
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormEstablishment({
  establishment,
  onSuccess,
  onClose,
}: FormEstablishmentProps) {
  const isEdit = !!establishment;
  const [isUploading, setIsUploading] = useState(false);
  const [circuites, setCircuites] = useState<Circuito[]>([]);
  const [loadingCircuites, setLoadingCircuites] = useState(false);

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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingCircuites(true);
        const res = await axiosInstance.get("/api/circuites");
        setCircuites(res.data.circuites);
      } catch (err) {
        toast.error("Error cargando circuitos");
      } finally {
        setLoadingCircuites(false);
      }
    };

    fetchOptions();
  }, []);

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
