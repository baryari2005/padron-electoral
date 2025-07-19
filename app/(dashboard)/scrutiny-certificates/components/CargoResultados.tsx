"use client";

import { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { UseFormReturn } from "react-hook-form";
import { CertificadoFormData } from "../utils/schema";

type AgrupacionPolitica = {
  id: string;
  nombre: string;
};

type Cargo = {
  id: string;
  nombre: string;
};

interface CargoResultadosProps {
  control: UseFormReturn<CertificadoFormData>["control"];
}

export default function CargoResultados({ control }: CargoResultadosProps) {
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionPolitica[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch("/api/political-groups");
        const agrup = await res1.json();
        setAgrupaciones(agrup);

        const res2 = await fetch("/api/cargos");
        const cargos = await res2.json();
        setCargos(cargos);
      } catch (err) {
        console.error("Error al cargar cargos o agrupaciones", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      {cargos.map((cargo) => (
        <div key={cargo.id}>
          <h3 className="text-lg font-semibold">{cargo.nombre}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {agrupaciones.map((agrupacion) => {
              const fieldName = `resultados` as const;

              // Identificador para cada resultado: cargoId + agrupacionId
              const resultadoId = `${cargo.id}-${agrupacion.id}`;

              return (
                <FormField
                  key={resultadoId}
                  control={control}
                  name={fieldName}
                  render={({ field }) => {
                    const currentIndex = field.value?.findIndex(
                      (r) => r.cargoId === cargo.id && r.agrupacionId === agrupacion.id
                    );

                    const votos = currentIndex !== -1 ? field.value[currentIndex].votos : "";

                    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                      const newValue = Number(e.target.value);

                      if (isNaN(newValue) || newValue < 0) return;

                      const updated = [...(field.value ?? [])];

                      if (currentIndex !== -1) {
                        updated[currentIndex] = { ...updated[currentIndex], votos: newValue };
                      } else {
                        updated.push({
                          cargoId: cargo.id,
                          agrupacionId: agrupacion.id,
                          votos: newValue,
                        });
                      }

                      field.onChange(updated);
                    };

                    return (
                      <FormItem>
                        <FormLabel>{agrupacion.nombre}</FormLabel>
                        <FormControl>
                          <Input
                            value={votos}
                            onChange={handleChange}
                            type="number"
                            min={0}
                            placeholder="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
