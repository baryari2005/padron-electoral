"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { circuitFormSchema, CircuitFormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";

interface FormCircuitProps {
  circuit?: {
    id: number;
    nombre: string,
    codigo: string
  };
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormCircuit({
  circuit,
  modo = "editar",
  onSuccess,
  onClose }: FormCircuitProps) {
  const isEdit = !!circuit;
  
  const isReadOnly = modo === "ver";

  const form = useForm<CircuitFormValues>({
    resolver: zodResolver(circuitFormSchema),
    defaultValues: {
      nombre: circuit?.nombre || "",
      codigo: circuit?.codigo || "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, isDirty } = form.formState;
  const canSubmit = isValid && !isSubmitting && (!isEdit || isDirty);


  const onSubmit = async (values: CircuitFormValues) => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/api/circuites/${circuit.id}`, values);
      } else {
        await axiosInstance.post("/api/circuites", values);
        toast.success(formatApiMessage("success.circuiteCreated"));
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
            name="codigo"
            label="Codigo del Circuito"
            placeholder="Ej: 397"
            disabled={!!circuit || isReadOnly}
            uppercase
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre del Circuito"
            placeholder="Ej: San Miguel 2025"
            disabled={isReadOnly}
            uppercase
          />
        </div>

        {!isReadOnly && (
          <div className="mt-4">
            <SubmitButton
              disabled={!canSubmit}
              loading={isSubmitting}
              label={circuit ? "Actualizar" : "Crear"}
              icon={circuit ? "pencil" : "plus"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}
