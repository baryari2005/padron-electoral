// src/features/users/components/FormUser.tsx
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { formatApiMessage, formatMessage } from "@/lib/utils/formatters";
import type { Rol, Usuario } from "@prisma/client";
import { buildUserSchema, BuildUserSchemaIn, BuildUserSchemaOut, getEscuelasIdsFromUser } from "@/src/features/users/lib/userForm.helpers";
import { useAutoAvatar } from "@/src/features/users/hooks/useAutoAvatar";
import { useRoleFlags } from "@/src/features/users/hooks/useRoleFlags";
import { useEscuelas } from "@/src/features/users/hooks/useEscuelas";
import { useCanSubmitUser } from "@/src/features/users/hooks/useCanSubmitUser";
import { UserBasicsFields } from "@/src/features/users/components/UserBasicsFields";
import { RolePasswordAvatar } from "@/src/features/users/components/RolePasswordAvatar";
import { EscuelasSection } from "@/src/features/users/components/EscuelasSection";


interface FormUserProps {
  user?: Usuario & { escuelas?: { establecimientoId: number }[]; escuelasIds?: number[] };
  onSuccess: () => void;
  onClose?: () => void;
  roles: Rol[];
}

export function FormUser({ user, onSuccess, onClose, roles = [] }: FormUserProps) {
  const isEdit = !!user;

  const schema = buildUserSchema(isEdit);
  type In = BuildUserSchemaIn<typeof schema>;
  type Out = BuildUserSchemaOut<typeof schema>;

  const form = useForm<In>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: user?.id ?? undefined,
      email: user?.email ?? "",
      password: "",
      avatarUrl: user?.avatarUrl ?? "",
      apellido: user?.apellido ?? "",
      nombre: user?.nombre ?? "",
      userId: user?.userId ?? "",
      rolId: user?.rolId ?? 0,
      escuelasIds: getEscuelasIdsFromUser(user),
    },
    mode: "onChange",
  });

  // reset si cambia el usuario
  useEffect(() => {
    if (!user) return;
    form.reset({
      id: user.id,
      email: user.email ?? "",
      password: "",
      avatarUrl: user.avatarUrl ?? "",
      apellido: user.apellido ?? "",
      nombre: user.nombre ?? "",
      userId: user.userId ?? "",
      rolId: user.rolId ?? 0,
      escuelasIds: getEscuelasIdsFromUser(user),
    });
  }, [user, form]);

  // auto-avatar
  useAutoAvatar(form, {
    nombre: "nombre",
    apellido: "apellido",
    avatarUrl: "avatarUrl",
  });

  // flags de rol
  const rolId = form.watch("rolId");
  const { puedeAsignar, requiereEscuela } = useRoleFlags(rolId, roles);

  // escuelas
  const { escuelas, loaded: escuelasLoaded } = useEscuelas(puedeAsignar || requiereEscuela);

  // submit
  const { isSubmitting, isValid } = form.formState;
  const escuelasIds = form.watch("escuelasIds") ?? [];
  const canSubmit = useCanSubmitUser({
    isSubmitting,
    isValid,
    requiereEscuela,
    escuelasLoaded,
    escuelasIdsLength: escuelasIds.length,
  });

  const onSubmit = async (values: In) => {
    try {
      const parsed: Out = schema.parse(values);
      const ids = parsed.escuelasIds ?? [];
      if (requiereEscuela && ids.length === 0) {
        toast.error("Este rol requiere al menos una escuela.");
        return;
      }

      const { password, ...rest } = parsed;
      const payload = { ...rest, ...(isEdit ? (password ? { password } : {}) : { password }) };

      if (isEdit) {
        await axiosInstance.put(`/api/users/${user!.id}`, payload);        
      } else {
        const res = await axiosInstance.post(`/api/users`, payload);
        const newId = (res as any)?.data?.created?.id ?? (res as any)?.data?.id ?? "";
        if (!newId) {
          toast.error("No se pudo obtener el ID del usuario creado");
          return;
        }
      }
      onSuccess();
      onClose?.();
    } catch (err: any) {
      const msg = err?.response?.data?.error?.includes("Unique constraint failed on the fields: (`email`)")
        ? "El correo electrónico ya está en uso."
        : err?.response?.data?.error || "Algo salió mal.";
      toast.error(formatMessage(msg));
    }
  };
  const loadingEscuelas = !escuelasLoaded;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <UserBasicsFields control={form.control} isEdit={!!isEdit} />
        <RolePasswordAvatar control={form.control as any} isEdit={!!isEdit} watch={form.watch as any} setValue={form.setValue as any} roles={roles} />

        <EscuelasSection
          visible={puedeAsignar || requiereEscuela}
          value={escuelasIds}
          onChange={(ids) => form.setValue("escuelasIds", ids, { shouldValidate: true })}
          required={requiereEscuela}
          escuelas={escuelas}
          loading={loadingEscuelas}
        />

        <div className="mt-4">
          <SubmitButton loading={isSubmitting} disabled={!canSubmit} label={isEdit ? "Actualizar" : "Crear"} icon={isEdit ? "pencil" : "plus"} />
        </div>
      </form>
    </Form>
  );
}
