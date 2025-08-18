"use client";
import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

import { AgrupacionPolitica } from "@prisma/client";
import { Categoria } from "./useCategorias";
import { buildDefaultVotosEspeciales, buildResultadosPresidenciales } from "../components/helpers";

export function useCertificadoDefaults<T extends { 
  votosEspeciales: any; 
  resultadosPresidenciales: any[];
}>(
  form: UseFormReturn<T>,
  modo: "crear" | "editar",
  agrupaciones: AgrupacionPolitica[],
  categorias: Categoria[]
) {
  const formReset = useRef(false);

  useEffect(() => {
    if (!formReset.current && modo === "crear" && agrupaciones.length && categorias.length) {
      form.reset({
        ...form.getValues(),
        votosEspeciales: buildDefaultVotosEspeciales(categorias) as any,
        resultadosPresidenciales: buildResultadosPresidenciales(agrupaciones, categorias) as any[],
      } as T);
      formReset.current = true;
    }
  }, [form, modo, agrupaciones, categorias]);
}
