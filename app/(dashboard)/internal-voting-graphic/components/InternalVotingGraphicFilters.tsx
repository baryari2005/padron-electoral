"use client";

import { Controller, Control, UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormCombobox } from "@/app/(dashboard)/components/FormsCreate";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { GraphicFormValues, PersonOption, PlanillaOption } from "./types";

type Props = {
  control: Control<GraphicFormValues>;
  setValue: UseFormSetValue<GraphicFormValues>;
  referentes: PersonOption[];
  planilleros: PersonOption[];
  planillas: PlanillaOption[];
  loadingOptions: boolean;
  loadingSearch: boolean;
  onRefresh: () => void;
  onResetPending: () => void;
};

export function InternalVotingGraphicFilters({
  control,
  setValue,
  referentes,
  planilleros,
  planillas,
  loadingOptions,
  loadingSearch,
  onRefresh,
  onResetPending,
}: Props) {
  const referentesOptions = [{ id: "", nombre: "Todos" }, ...referentes];
  const planillerosOptions = [{ id: "", nombre: "Todos" }, ...planilleros];
  const planillasOptions = [{ id: "", nombre: "Todas" }, ...planillas];

  return (
    <Card className="p-4 pt-6 pb-8 ">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Controller
          control={control}
          name="referenteId"
          render={({ field }) => (
            <div>
              <Label className="mb-1 block">Referente</Label>
              <FormCombobox
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  setValue("planilleroId", "");
                  setValue("planillaId", "");
                  onResetPending();
                  onRefresh();
                }}
                options={referentesOptions}
                getOptionLabel={(x: PersonOption) => x.nombre}
                getOptionValue={(x: PersonOption) => String(x.id)}
                loading={loadingOptions}
                disabled={loadingOptions}
                placeholder="Todos"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="planilleroId"
          render={({ field }) => (
            <div>
              <Label className="mb-1 block">Planillero</Label>
              <FormCombobox
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  setValue("planillaId", "");
                  onResetPending();
                  onRefresh();
                }}
                options={planillerosOptions}
                getOptionLabel={(x: PersonOption) => x.nombre}
                getOptionValue={(x: PersonOption) => String(x.id)}
                loading={loadingOptions}
                disabled={loadingOptions}
                placeholder="Todos"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="planillaId"
          render={({ field }) => (
            <div>
              <Label className="mb-1 block">Planilla</Label>
              <FormCombobox
                className="!min-h-0 h-auto"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  onResetPending();
                  onRefresh();
                }}
                options={planillasOptions}
                getOptionLabel={(x: PlanillaOption) => x.nombre}
                getOptionValue={(x: PlanillaOption) => String(x.id)}
                loading={loadingOptions}
                disabled={loadingOptions}
                placeholder="Todas"
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="query"
          render={({ field }) => (
            <div>
              <Label className="mb-1 block">Búsqueda</Label>
              <div className="flex gap-2">
                <Input
                  {...field}
                  placeholder="Apellido, nombre o DNI"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRefresh();
                  }}
                />
                <Button type="button" onClick={onRefresh} disabled={loadingSearch}>
                  <Search className="h-4 w-4" />
                  {loadingSearch && <Loader2 className="h-4 w-4 animate-spin" />}
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    </Card>
  );
}