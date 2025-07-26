"use client";

import { useWatch } from "react-hook-form";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  control: any;
  categorias: Categoria[];
}

export function ValidacionTotalesPorCategoria({ control, categorias }: Props) {
  const sobres = useWatch({ control, name: "totales.sobres" }) ?? 0;
  const votosEspeciales = useWatch({ control, name: "votosEspeciales" }) ?? {};
  const resultadosPresidenciales = useWatch({ control, name: "resultadosPresidenciales" }) ?? [];

  const resultadoPorCategoria = categorias.map((cat) => {
    // Sumar votos especiales de esta categoría
    const especialesSum = Object.values(votosEspeciales?.[cat.id] || {}).reduce(
      (acc: number, val: any) => acc + (Number(val) || 0),
      0
    );

    // Sumar votos presidenciales de todas las agrupaciones para esta categoría
    const presidencialesSum = resultadosPresidenciales.reduce(
      (acc: number, curr: any) => acc + (Number(curr?.[cat.id]) || 0),
      0
    );

    const total = especialesSum + presidencialesSum;
    const coincide = total === sobres;

    return {
      categoriaId: cat.id,
      nombre: cat.nombre,
      total,
      coincide,
    };
  });

  const algunaInconsistente = resultadoPorCategoria.some((r) => !r.coincide);

  return (
    <div
      className={`rounded-md border text-sm mt-4 ${algunaInconsistente
          ? "border-red-500 bg-red-50 text-red-700"
          : "border-green-500 bg-green-50 text-green-700"
        }`}
    >
      <div className="px-4 py-2 font-semibold flex items-center gap-2 border-b border-muted">
        {algunaInconsistente ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            Inconsistencias en la suma de votos por columna
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            Todos los totales por columna coinciden con la cantidad de sobres
          </>
        )}
      </div>

      <ul className="px-4 py-2 space-y-1">
        {resultadoPorCategoria.map((r) => (
          <li key={r.categoriaId} className="flex justify-between items-center">
            <span className="uppercase">total de votos cargados para {r.nombre}</span>
            <span
              className={`text-xs font-semibold ${r.coincide ? "text-green-600" : "text-red-600"
                }`}
            >
              <div className="flex items-center gap-1 text-sm font-semibold">
                <span>{r.total} / {sobres}</span>
                {r.coincide ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
