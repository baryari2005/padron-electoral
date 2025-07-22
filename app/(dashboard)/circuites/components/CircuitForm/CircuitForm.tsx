"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { circuitFormSchema, CircuitFormValues } from "../../lib";

interface FormCircuitProps {
  circuit?: { id: number; nombre: string, codigo: string };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormCircuit({ circuit, onSuccess, onClose }: FormCircuitProps) {
  const form = useForm<CircuitFormValues>({
    resolver: zodResolver(circuitFormSchema),
    defaultValues: {
      nombre: circuit?.nombre || "",
      codigo: circuit?.codigo || "",
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CircuitFormValues) => {
    try {
      if (circuit) {
        await axiosInstance.put(`/api/circuites/${circuit.id}`, values);
        toast.success("Circuito actualizado correctamente");
      } else {
        await axiosInstance.post("/api/circuites", values);
        toast.success("Circuito creado correctamente");
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
            name="codigo"
            label="Codigo del Circuito"
            placeholder="Ej: 397"               
            disabled={!!circuit}    
            uppercase     
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre del Circuito"
            placeholder="Ej: SAN MIGUEL"
            uppercase
          />
        </div>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting}
            label={circuit ? "Actualizar" : "Crear"}
            icon={circuit ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
