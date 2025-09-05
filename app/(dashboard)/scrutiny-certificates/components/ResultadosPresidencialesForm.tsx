"use client";

import { Control, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { CertificadoFormData } from "../utils/schema";
import { getAvatarUrl } from "@/utils/avatar";
import { LogoConFallback } from "../../components/common/LogoConFallback";
import type { AgrupacionPolitica } from "@prisma/client";

interface Categoria {
  id: string;
  nombre: string;
}

interface ResultadosPresidencialesFormProps {
  control: Control<CertificadoFormData>;
  resultadosPresidenciales: CertificadoFormData["resultadosPresidenciales"];
  categorias: Categoria[];

  // 👇 NUEVO
  agrupaciones: AgrupacionPolitica[];
  habilitadosPorAgrupacion: Record<number, Set<number>>;
  loadingPermisos?: boolean;
}

export function ResultadosPresidencialesForm({
  control,
  resultadosPresidenciales,
  categorias,

  agrupaciones,
  habilitadosPorAgrupacion,
  loadingPermisos = false,
}: ResultadosPresidencialesFormProps) {
  const { fields } = useFieldArray({
    control,
    name: "resultadosPresidenciales",
  });

  const valores = useWatch({ control, name: "resultadosPresidenciales" });
  const [totales, setTotales] = useState<Record<string, number>>({});

  const gridStyle = {
    //gridTemplateColumns: `60px 1fr repeat(${categorias.length}, minmax(88px, 120px))`,
    gridTemplateColumns: `60px 1fr repeat(${categorias.length}, 100px)`,
  };

  useEffect(() => {
    const nuevosTotales: Record<string, number> = {};
    categorias.forEach((cat) => {
      nuevosTotales[cat.id] =
        valores?.reduce((sum, r) => sum + (Number((r as any)?.[cat.id]) || 0), 0) || 0;
    });
    setTotales(nuevosTotales);
  }, [valores, categorias]);

  // helper para saber si un input debe estar habilitado
  const isHabilitado = (agrupacionId: number | undefined, catId: string): boolean => {
    if (!agrupacionId) return false; // si no sabemos la agrupación, bloquear
    if (loadingPermisos) return false; // mientras carga la matriz, bloquear
    const set = habilitadosPorAgrupacion[agrupacionId];
    if (!set) return false;
    return set.has(Number(catId));
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div style={gridStyle} className="grid font-semibold text-xs gap-2 px-2">
        <div>LOGO</div>
        <div>AGRUPACIONES POLITICAS</div>        
        {categorias.map((cat) => (
          <div key={cat.id} className="text-center">
            {cat.nombre.toUpperCase()}
          </div>
        ))}
      </div>

      <Separator />

      {/* Filas de datos */}
      {fields.map((field, index) => {
        const resultado = resultadosPresidenciales[index];
        const nombre = resultado?.nombre ?? "SIN NOMBRE";
        const numero = resultado?.numero ?? "-";
        const imagen = getAvatarUrl(nombre, resultado?.profileImage ?? undefined);

        const agrupacionId = agrupaciones[index]?.id; // 👈 asumimos mismo orden

        return (
          <div
            key={field.id}
            style={gridStyle}
            className="grid items-center gap-2 even:bg-muted/50 p-2 rounded-md"
          >
            <div>
              <LogoConFallback src={imagen} alt={nombre}  unoptimized={true}/>
            </div>

            <div className="text-sm flex items-center gap-1 uppercase">
              Lista {numero} - {nombre}
            </div>
            
            {categorias.map((cat) => {
              const habilitado = isHabilitado(agrupacionId, cat.id);

              return (
                <FormField
                  key={cat.id}
                  name={`resultadosPresidenciales.${index}.${cat.id}` as const}
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className={`h-8 text-sm px-2 text-right ${
                            !habilitado ? "bg-muted/60 opacity-70 cursor-not-allowed" : ""
                          }`}
                          {...field}
                          disabled={!habilitado}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        );
      })}

      <Separator />

      {/* Totales */}
      <div style={gridStyle} className="grid font-bold text-sm">
        <div className="col-span-2 uppercase">
          total votos por agrupaciones políticas
        </div>
        {categorias.map((cat) => (
          <div key={cat.id} className="text-right mr-4">
            {totales[cat.id] ?? 0}
          </div>
        ))}
      </div>
    </div>
  );
}
