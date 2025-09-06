"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate/SubmitButton";
import { formatApiMessage } from "@/lib/utils/formatters";
import { politicalGroupFormSchema } from "../../lib";
import { useCargos } from "@/src/features/political-groups/hooks/useCargos";
import { useGroupCargoIds } from "@/src/features/political-groups/hooks/useGroupCargoIds";
import { createPoliticalGroup, updatePoliticalGroup } from "@/src/features/political-groups/services/politicalGroups.service";
import { AvatarField, CargoSwitchList, ColorHexField, NumberNameFields } from "@/src/features/political-groups/components/fields";


// Tipos externos
export type PGFormOutput = z.output<typeof politicalGroupFormSchema>;

interface FormPoliticalGroupProps {
  politicalGroup?: {
    id: number;
    nombre: string;
    numero: number;
    profileImage: string;
    color_hex: string;
    orden: number;
  };
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormPoliticalGroup({
  politicalGroup,
  modo = "editar",
  onSuccess,
  onClose,
}: FormPoliticalGroupProps) {
  const isReadOnly = modo === "ver";

  const form = useForm<PGFormOutput>({
    resolver: zodResolver(politicalGroupFormSchema) as unknown as Resolver<PGFormOutput>,
    defaultValues: {
      nombre: politicalGroup?.nombre ?? "",
      numero: politicalGroup?.numero ?? undefined,
      profileImage: politicalGroup?.profileImage ?? "",
      color_hex: politicalGroup?.color_hex ?? "#2D3135",
      orden: politicalGroup?.orden ?? 0,
      cargoIds: [],
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;
  const [isUploading, setIsUploading] = useState(false);

  // Data hooks
  const { cargos, loading } = useCargos();
  const groupCargoIds = useGroupCargoIds(politicalGroup?.id);

  // sync de cargoIds al form cuando ya tengo ambos
  useEffect(() => {
    if (loading) return;
    if (groupCargoIds === null) return; // aún no terminó
    form.setValue("cargoIds", groupCargoIds, { shouldValidate: true });
  }, [loading, groupCargoIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit: SubmitHandler<PGFormOutput> = async (values) => {
    try {
      if (politicalGroup) {
        await updatePoliticalGroup(politicalGroup.id, values);
        toast.success(formatApiMessage("success.politicalGroupUpdated"));
      } else {
        await createPoliticalGroup(values);
        toast.success(formatApiMessage("success.politicalGroupCreated"));
      }
      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Algo salió mal.";
      toast.error(msg);
    }
  };

  const canSubmit = useMemo(
    () => !isReadOnly && !isUploading && !loading && isValid,
    [isReadOnly, isUploading, loading, isValid]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Número / Nombre */}
        <NumberNameFields control={form.control} readOnly={isReadOnly} />

        {/* Color + Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ColorHexField control={form.control} readOnly={isReadOnly} />
          <AvatarField
            control={form.control}
            nameWatcher={form.watch("nombre")}
            readOnly={isReadOnly}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        </div>

        {/* Cargos habilitados */}
        <CargoSwitchList
          control={form.control}
          cargos={cargos}
          loading={loading}
          readOnly={isReadOnly}
        />

        {!isReadOnly && (
          <div className="mt-4">
            <SubmitButton
              loading={isSubmitting || isUploading}
              disabled={!canSubmit}
              label={politicalGroup ? "Actualizar" : "Crear"}
              icon={politicalGroup ? "pencil" : "plus"}
            />
          </div>
        )}
      </form>
    </Form>
  );
}