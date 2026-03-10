"use client";

import { Control, UseFormSetValue, Controller, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Info } from "lucide-react";
import { FormCombobox } from "@/app/(dashboard)/components/FormsCreate";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  InternalVotingFormValues,
  EstablishmentOption,
  Mesa,
  GroupByMode,
  PersonOption,
} from "./types";

type Props = {
  control: Control<InternalVotingFormValues>;
  setValue: UseFormSetValue<InternalVotingFormValues>;
  establecimientos: EstablishmentOption[];
  mesas: Mesa[];
  referentes: PersonOption[];
  planilleros: PersonOption[];
  loadingEstabs: boolean;
  loadingMesas: boolean;
  loadingPersons: boolean;
  loadingSearch: boolean;
  onRefresh: () => void;
  onResetPending: () => void;
};

const GROUP_BY_OPTIONS: { value: GroupByMode; label: string }[] = [
  { value: "orden", label: "Orden de padrón" },
  { value: "referente", label: "Referente" },
  { value: "planillero", label: "Planillero" },
  { value: "planilla", label: "N° de planilla" },
];

export function InternalVotingFilters({
  control,
  setValue,
  establecimientos,
  mesas,
  referentes,
  planilleros,
  loadingEstabs,
  loadingMesas,
  loadingPersons,
  loadingSearch,
  onRefresh,
  onResetPending,
}: Props) {
  const establecimientoId = useWatch({
    control,
    name: "establecimientoId",
  });

  const establecimientosOptions: EstablishmentOption[] = [
    { id: "", nombre: "Todos" },
    ...establecimientos,
  ];

  const mesasOptions: Mesa[] = [
    { id: "", numero: 0 },
    ...mesas,
  ];

  const referentesOptions: PersonOption[] = [
    { id: "", nombre: "Todos" },
    ...referentes,
  ];

  const planillerosOptions: PersonOption[] = [
    { id: "", nombre: "Todos" },
    ...planilleros,
  ];

  return (
    <Card className="p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 items-start">
        <Controller
          control={control}
          name="establecimientoId"
          render={({ field }) => (
            <div className="min-w-0">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Establecimiento
              </Label>
              <FormCombobox                
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  setValue("mesaId", "");
                  onResetPending();
                  onRefresh();
                }}
                options={establecimientosOptions}
                getOptionLabel={(e: EstablishmentOption) =>
                  e.id === "" ? "Todos" : e.nombre
                }
                getOptionValue={(e: EstablishmentOption) => String(e.id)}
                loading={loadingEstabs}
                disabled={loadingEstabs}
                placeholder={loadingEstabs ? "Cargando..." : "Todos"}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="mesaId"
          render={({ field }) => (
            <div className="min-w-0">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Mesa
              </Label>
              <FormCombobox                
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  onResetPending();
                  onRefresh();
                }}
                options={mesasOptions}
                getOptionLabel={(m: Mesa) =>
                  m.id === "" ? "Todos" : `Mesa ${m.numero}`
                }
                getOptionValue={(m: Mesa) => String(m.id)}
                disabled={!establecimientoId || loadingMesas}
                loading={loadingMesas}
                placeholder={
                  !establecimientoId
                    ? "Primero elegí escuela"
                    : loadingMesas
                      ? "Cargando..."
                      : "Todos"
                }
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="referenteId"
          render={({ field }) => (
            <div className="min-w-0">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Referente
              </Label>
              <FormCombobox                
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  setValue("planilleroId", "");
                  onResetPending();
                  onRefresh();
                }}
                options={referentesOptions}
                getOptionLabel={(item: PersonOption) => item.nombre}
                getOptionValue={(item: PersonOption) => String(item.id)}
                loading={loadingPersons}
                disabled={loadingPersons}
                placeholder={loadingPersons ? "Cargando..." : "Todos"}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="planilleroId"
          render={({ field }) => (
            <div className="min-w-0">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Planillero
              </Label>
              <FormCombobox                
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  onResetPending();
                  onRefresh();
                }}
                options={planillerosOptions}
                getOptionLabel={(item: PersonOption) => item.nombre}
                getOptionValue={(item: PersonOption) => String(item.id)}
                loading={loadingPersons}
                disabled={loadingPersons}
                placeholder={loadingPersons ? "Cargando..." : "Todos"}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="groupBy"
          render={({ field }) => (
            <div className="min-w-0">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Agrupar por
              </Label>
              <FormCombobox                
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v as GroupByMode);
                  onRefresh();
                }}
                options={GROUP_BY_OPTIONS}
                getOptionLabel={(item) => item.label}
                getOptionValue={(item) => item.value}
                placeholder="Seleccionar"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="query"
          render={({ field }) => (
            <div className="min-w-0 2xl:col-span-2">
              <Label className="block text-sm font-medium leading-5 mb-1">
                Búsqueda manual
              </Label>
              <div className="flex gap-2">
                <Input
                  {...field}
                  placeholder="Apellido, nombre, DNI, referente, planillero o planilla"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRefresh();
                  }}
                />
                <Button type="button" onClick={onRefresh} disabled={loadingSearch}>
                  <Search className="h-4 w-4" />
                  {loadingSearch && <Loader2 className="h-4 w-4 animate-spin" />}
                  Buscar
                </Button>
              </div>
            </div>
          )}
        />
      </div>

      <Separator className="mt-3 mb-0" />

      <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 animate-pulse">
        <Info className="w-4 h-4"/>Podés filtrar por referente o planillero sin elegir escuela. Si elegís un referente,
        el combo de planilleros se acota solo a los asociados a ese referente.
      </p>
    </Card>
  );
}