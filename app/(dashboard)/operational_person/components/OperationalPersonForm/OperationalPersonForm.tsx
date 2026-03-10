"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import { operationalPersonFormSchema, OperationalPersonFormValues } from "../../lib";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/app/(dashboard)/components/FormsCreate/PhoneInput";

interface FormOperationalPersonProps {
  operationalPerson?: {
    id: number;
    nombre: string;
    telefono?: string;
    tipo: "REFERENTE" | "PLANILLERO" | "CHOFER";
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormOperationalPerson({ operationalPerson, onSuccess, onClose }: FormOperationalPersonProps) {
  const isEdit = !!operationalPerson;
  const form = useForm<OperationalPersonFormValues>({
    resolver: zodResolver(operationalPersonFormSchema),
    defaultValues: {
      nombre: operationalPerson?.nombre || "",
      telefono: operationalPerson?.telefono || "",
      tipo: operationalPerson?.tipo,
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, isDirty } = form.formState;
  const canSubmit = isValid && !isSubmitting && (!isEdit || isDirty);

  const onSubmit = async (values: OperationalPersonFormValues) => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/api/operational_person/${operationalPerson.id}`, values);
      } else {
        await axiosInstance.post("/api/operational_person", values);
        toast.success(formatApiMessage("success.operationaPersonCreated"));
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
            label="Nombre del Operador"
            placeholder=""
            uppercase
          />
          <PhoneInput
            control={form.control}
            name="telefono"
            label="Teléfono (opcional)"
          />
        </div>
        <div>
          <Controller
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}                  
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REFERENTE">REFERENTE</SelectItem>
                    <SelectItem value="PLANILLERO">PLANILLERO</SelectItem>
                    <SelectItem value="CHOFER">CHOFER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>

        <div className="mt-4">
          <SubmitButton
            disabled={!canSubmit}
            loading={isSubmitting}
            label={operationalPerson ? "Actualizar" : "Crear"}
            icon={operationalPerson ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
