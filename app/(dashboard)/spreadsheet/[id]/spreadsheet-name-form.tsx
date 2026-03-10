"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";

const schema = z.object({
  nombre: z
    .string()
    .min(2, "Debe tener al menos 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .transform((v) => v.toUpperCase()),
});

type Values = z.infer<typeof schema>;

export default function SpreadsheetNameForm({
  spreadsheet,
  onSuccess,
}: {
  spreadsheet: { id: number; nombre?: string | null };
  onSuccess: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: spreadsheet?.nombre ?? "" },
    mode: "onChange",
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  const onSubmit = async (values: Values) => {
    try {
      await axiosInstance.put(`/api/spreadsheet/${spreadsheet.id}`, {
        nombre: values.nombre,
      });
      toast.success("Planilla actualizada");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? "No se pudo actualizar.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormTextField
          control={form.control}
          name="nombre"
          label="Nombre de la Planilla"
          placeholder="Ej: PLANILLA MESA 16"
          uppercase
        />

        <SubmitButton
          disabled={!isValid || isSubmitting || !isDirty}
          loading={isSubmitting}
          label="Actualizar"
          icon="pencil"
        />
      </form>
    </Form>
  );
}