"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, SubmitHandler, Resolver } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import axiosInstance from "@/utils/axios";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { politicalGroupFormSchema } from "../../lib";
import {
  FormAvatarUploader,
  FormTextField,
} from "@/app/(dashboard)/components/FormsCreate";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate/SubmitButton";
import { formatApiMessage } from "@/lib/utils/formatters";
import { Cargando } from "@/components/ui/upload";
import Image from "next/image";

interface FormPoliticalGroupProps {
  politicalGroup?: {
    id: number;
    nombre: string;
    numero: number;
    profileImage: string;
    color_hex: string;
  };
  modo?: "ver" | "editar";
  onSuccess: () => void;
  onClose?: () => void;
}

type Cargo = { id: number; nombre: string };
type PGFormOutput = z.output<typeof politicalGroupFormSchema>;

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
      cargoIds: [],
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;
  const [isUploading, setIsUploading] = useState(false);

  // ---------- CARGA DE CARGOS ----------
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCargos(true);
        const { data } = await axiosInstance.get("/api/categories?all=true");
        if (!mounted) return;

        const itemsRaw = (data?.items ?? []) as Array<{ id: number | string; nombre: string }>;
        const items: Cargo[] = itemsRaw.map((it) => ({
          id: Number(it.id),
          nombre: it.nombre,
        }));
        console.log("[Form] cargos:", items);
        setCargos(items);
      } catch (e) {
        console.error("[Form] error cargando cargos:", e);
        setCargos([]);
        toast.error("No se pudieron cargar los cargos.");
      } finally {
        if (mounted) setLoadingCargos(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- TRAER cargoIds DEL GRUPO ----------
  const [groupCargoIds, setGroupCargoIds] = useState<number[] | null>(null);

  useEffect(() => {
    if (!politicalGroup?.id) return;
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/political-groups/${politicalGroup.id}`);
        const ids: number[] = Array.isArray(data?.cargoIds)
          ? data.cargoIds.map((x: any) => Number(x))
          : [];
        console.log("[Form] GET /political-groups/:id cargoIds:", ids);
        setGroupCargoIds(ids);
      } catch (e) {
        console.error("[Form] error cargando cargoIds del grupo:", e);
        setGroupCargoIds([]);
      }
    })();
  }, [politicalGroup?.id]);

  // ---------- SINCRONIZAR EN EL FORM (solo cuando ya tengo ambos) ----------
  useEffect(() => {
    if (loadingCargos) return;
    if (groupCargoIds === null) return; // todavía no llegó el GET
    form.setValue("cargoIds", groupCargoIds, { shouldValidate: true });
    console.log("[Form] setValue cargoIds ->", groupCargoIds);
  }, [loadingCargos, groupCargoIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleId = (current: number[] | undefined, id: number, checked: boolean) => {
    const s = new Set(current ?? []);
    if (checked) s.add(id);
    else s.delete(id);
    return Array.from(s);
  };

  const onSubmit: SubmitHandler<PGFormOutput> = async (values) => {
    console.log("[Form] submit values:", values);
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

  const canSubmit = useMemo(
    () => !isReadOnly && !isUploading && !loadingCargos && isValid,
    [isReadOnly, isUploading, loadingCargos, isValid]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Número / Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormTextField
            control={form.control}
            name="numero"
            label="Número"
            placeholder="Ej: 130"
            uppercase
            disabled={isReadOnly}
          />
          <FormTextField
            control={form.control}
            name="nombre"
            label="Nombre"
            placeholder="Ej: FUERZA PATRIA"
            uppercase
            disabled={isReadOnly}
          />
        </div>

        {/* Color + Avatar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color de la agrupación</Label>
            <Controller
              control={form.control}
              name="color_hex"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={field.value}
                    disabled={isReadOnly}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-10 w-16 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={field.value}
                    disabled={isReadOnly}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="flex-1"
                    placeholder="#2D3135"
                  />
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: field.value }}
                    aria-label="Preview color"
                    title={field.value}
                  />
                </div>
              )}
            />
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <Label className="text-sm font-medium invisible md:visible">Cambiar avatar</Label>
            {!isReadOnly ? (
              <FormAvatarUploader
                name={form.watch("nombre")}
                avatarUrl={form.watch("profileImage")}
                onAvatarUploaded={(url) =>
                  form.setValue("profileImage", url, { shouldValidate: true })
                }
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            ) : (
              <Image
                src={form.watch("profileImage") || "/placeholder.svg"}
                alt="Avatar"
                className="h-16 w-16 rounded-full border object-cover"
              />
            )}
          </div>
        </div>

        {/* Cargos habilitados */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Compite en cargo político?</Label>
            <span className="text-xs text-muted-foreground">
              {loadingCargos ? "…" : (form.watch("cargoIds") ?? []).length}
            </span>
          </div>

          {loadingCargos ? (
            <Cargando variant="container" labelSize="text-sm" label="Cargando cargos habilitados..." />
          ) : (
            <Controller
              control={form.control}
              name="cargoIds"
              render={({ field }) => {
                const selected = Array.isArray(field.value) ? field.value : [];
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cargos.map((c) => {
                      const idNum = Number(c.id);
                      const checked = selected.includes(idNum);
                      return (
                        <label
                          key={idNum}
                          className="flex items-center justify-between rounded p-2"
                        >
                          <span className="text-xs">{c.nombre}</span>
                          <Switch
                            checked={checked}
                            disabled={isReadOnly}
                            onCheckedChange={(v) =>
                              field.onChange(
                                toggleId(selected, idNum, Boolean(v))
                              )
                            }
                            aria-label={`Habilitar ${c.nombre}`}
                          />
                        </label>
                      );
                    })}
                  </div>
                );
              }}
            />
          )}

          {isReadOnly && (
            <p className="text-xs text-muted-foreground">(Solo lectura)</p>
          )}
        </div>

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
