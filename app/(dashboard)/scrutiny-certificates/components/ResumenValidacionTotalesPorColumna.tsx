"use client";

import { useWatch } from "react-hook-form";
import { CertificadoFormData } from "../utils/schema";
import { AlertCircle, TriangleAlert } from "lucide-react";

interface Categoria {
  id: string;
  nombre: string;
}

interface Props {
  control: any;
  categorias: Categoria[];
}

export function ResumenValidacionTotalesPorColumna({ control, categorias }: Props) {
  const sobres = useWatch({ control, name: "totales.sobres" }) ?? 0;
  const votosEspeciales = useWatch({ control, name: "votosEspeciales" }) ?? {};
  const resultadosPresidenciales = useWatch({ control, name: "resultadosPresidenciales" }) ?? [];

  const data = categorias.map((cat) => {
    const especiales = Object.values(votosEspeciales?.[cat.id] || {}).reduce(
      (acc: number, val: any) => acc + (Number(val) || 0),
      0
    );

    const presidenciales = resultadosPresidenciales.reduce(
      (acc: number, curr: any) => acc + (Number(curr?.[cat.id]) || 0),
      0
    );

    const total = especiales + presidenciales;
    const coincide = total === sobres;

    return {
      id: cat.id,
      nombre: cat.nombre.toUpperCase(),
      total,
      coincide,
    };
  });

  const gridStyle = {
    gridTemplateColumns: `1fr repeat(${categorias.length}, 100px)`,
  };

  const columnasInconsistentes = data.filter((cat) => !cat.coincide);

  return (
    <div className="space-y-2 mt-4">
      {/* Header */}
      <div style={gridStyle} className="grid text-xs font-semibold items-center px-2">
        <div className="font-bold text-sm uppercase">control total de votos (*)</div>
        {data.map((cat) => (
          <div key={cat.id} className="text-center">{cat.nombre}</div>
        ))}
      </div>

      {/* Fila */}
      <div style={gridStyle} className="grid items-center text-sm gap-2 px-2 py-1">
        <div className="font-bold text-muted-foreground text-xs uppercase">Total votos cargados</div>

        {data.map((cat) => (
          <input
            key={cat.id}
            value={cat.total}
            disabled
            className={`text-sm px-2 h-8 text-center rounded-md border 
              ${cat.coincide
                ? "bg-green-100 text-green-800 border-green-400"
                : "bg-red-100 text-red-800 border-red-400"
              }`}
          />
        ))}
      </div>

      {/* Mensaje de inconsistencia con detalle */}
      {columnasInconsistentes.length > 0 && (
        <div
          style={gridStyle}
          className="grid text-sm text-red-700 px-2 py-2"
        >
          <div className={`col-span-${categorias.length + 1} text-center flex flex-col items-center gap-1`}>
            <div className="flex items-center gap-1 font-medium uppercase">
              <TriangleAlert className="w-4 h-4" />
              <span>Inconsistencias en el recuento de votos.</span>
            </div>
            {/* <ul className="list-disc list-inside text-xs text-red-700">
              {columnasInconsistentes.map((c) => (
                <li key={c.id} className="font-semibold">{c.nombre}</li>
              ))}
            </ul> */}
          </div>
        </div>
      )}
    </div>
  );
}
