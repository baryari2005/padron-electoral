"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

import {
  FormAvatarUploader,
  FormTextField,
  SubmitButton,
  FormCombobox2,
  FormTags
} from "@/app/(dashboard)/components/FormsCreate";

import { Circuito, Establecimiento } from "@prisma/client";
import { FormValues, getFormSchema } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";

interface FormEstablishmentProps {
  establishment?: Establecimiento;
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormEstablishment({
  establishment,
  modo = "editar",
  onSuccess,
  onClose,
}: FormEstablishmentProps) {
  const isReadOnly = modo === "ver";
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
      circuitoId: establishment?.circuitoId ?? 0,
      numerosDeMesa: [],
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;
  const numerosDeMesa = form.watch("numerosDeMesa");

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        circuitId: Number(values.circuitoId),
      };

      if (isEdit) {
        await axiosInstance.put(`/api/establishments/${establishment.id}`, payload);
      } else {
        await axiosInstance.post("/api/establishments", payload);
        toast.success(formatApiMessage("success.establishmentCreated"));
      }

      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(formatMessage(msg));
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingCircuites(true);
        const res = await axiosInstance.get("/api/circuites?all=true");
        setCircuites(res.data.items);
      } catch (err) {
        toast.error(formatMessage("Error cargando circuitos"));
      } finally {
        setLoadingCircuites(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (isEdit && "mesasPorEstablecimiento" in (establishment || {})) {
      const mesas = (establishment as any).mesasPorEstablecimiento;
      if (Array.isArray(mesas)) {
        const numeros = mesas.map((m) => m.numero);
        form.setValue("numerosDeMesa", numeros);
      }
    }
  }, [isEdit, establishment]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre"
            placeholder="Nombre..."
            disabled={isReadOnly}
            uppercase
          />
          <FormTextField
            control={form.control}
            name="direccion"
            label="Dirección"
            placeholder="Dirección..."
            disabled={isReadOnly}
            uppercase
          />

          <FormField
            control={form.control}
            name="circuitoId"
            render={({ field }) => {
              const selectedCircuito = circuites.find((c) => c.id === Number(field.value));              
              const displayValue = selectedCircuito
                ? `${selectedCircuito.codigo} - ${selectedCircuito.nombre}`
                : "Sin asignar";                

              return isReadOnly ? (
                <FormTextField
                  control={form.control}
                  name=""
                  label="Circuito"
                  placeholder={displayValue}
                  disabled
                />
              ) : (
                <FormCombobox2
                  label="Circuito"
                  value={String(field.value)}
                  onChange={field.onChange}
                  options={circuites}
                  getOptionLabel={(c) => `${c.codigo} - ${c.nombre}`}
                  getOptionValue={(c) => String(c.id)}
                  loading={loadingCircuites}
                />
              );
            }}
          />
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
        </div>

        {/* ✅ Bloque visual mejorado para números de mesa */}
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Números de Mesa</h3>
            {(numerosDeMesa ?? []).length > 0 && (
              <span className="text-xs text-muted-foreground">
                ({(numerosDeMesa ?? []).length})
              </span>
            )}
          </div>

          <FormField
            control={form.control}
            name="numerosDeMesa"
            render={({ field }) => (
              <FormTags
                label=""
                values={field.value ?? []}
                onChange={field.onChange}
                type="text"
                placeholder="Ej: 132 o 1...5"
                modo={modo}
              />
            )}
          />

        </div>

        {!isReadOnly && (
          <div>
            <SubmitButton
              loading={isSubmitting || isUploading}
              label={isEdit ? "Actualizar" : "Crear"}
              icon={isEdit ? "pencil" : "plus"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}
