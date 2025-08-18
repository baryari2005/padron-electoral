"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { FormTextField, SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { categoryFormSchema, CategoryFormValues } from "../../lib";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";

interface FormCategoryProps {
  category?: {
    id: number;
    nombre: string;
    orden: number;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormCategory({ category, onSuccess, onClose }: FormCategoryProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nombre: category?.nombre || "",
      orden: category?.orden ?? 0,
    },
    mode: "onChange",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const isEdit = !!category;

      if (isEdit) {
        await axiosInstance.put(`/api/categories/${category.id}`, values);
      } else {
        await axiosInstance.post("/api/categories", values);
        toast.success(formatApiMessage("success.categoryCreated"));
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
            label="Nombre del Cargo Político"
            placeholder="Ej: PRESIDENTE"
            uppercase
          />
          <FormTextField
            control={form.control}
            name="orden"
            label="Orden (opcional)"
            placeholder="1"
            type="number"
            min={1}
            step={1}            
          />
        </div>

        <div className="mt-4">
          <SubmitButton
            loading={isSubmitting}
            label={category ? "Actualizar" : "Crear"}
            icon={category ? "pencil" : "plus"}
          />
        </div>
      </form>
    </Form>
  );
}
