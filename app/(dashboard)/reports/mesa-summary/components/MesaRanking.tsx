import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MesaVoteSummary } from "./types";
import { buildRankingByCategoria } from "../../utils/chartUtils";

interface MesaRankingProps {
  resultados: MesaVoteSummary["resultados"];
}

export function MesaRanking({ resultados }: MesaRankingProps) {
  const agrupado: Record<
    string,
    { agrupacion: string; votos: number; logo?: string | null }[]
  > = buildRankingByCategoria(resultados);


  const ranking = Object.entries(agrupado).reduce((acc, [categoria, valores]) => {
    acc[categoria] = Object.values(valores).sort((a, b) => b.votos - a.votos);
    return acc;
  }, {} as Record<string, { agrupacion: string; votos: number; logo?: string | null }[]>);

  const ordenCategorias = ["DIPUTADOS", "SENADORES"];

  // Estado para mostrar/ocultar categorías
  const [visibleCategorias, setVisibleCategorias] = useState<Record<string, boolean>>({
    DIPUTADOS: true,
    SENADORES: true,
  });

  const toggleCategoria = (categoria: string) => {
    setVisibleCategorias((prev) => ({
      ...prev,
      [categoria]: !prev[categoria],
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(ranking)
        .sort(([a], [b]) => ordenCategorias.indexOf(a) - ordenCategorias.indexOf(b))
        .map(([categoria, agrupaciones]) => (
          <div key={categoria}>
            {/* Encabezado con ícono toggle */}
            <div
              className="flex items-center gap-2 cursor-pointer font-semibold text-xs mb-4"
              onClick={() => toggleCategoria(categoria)}
            >
              <span>{categoria}</span>
              {visibleCategorias[categoria] ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </div>

            {/* Contenido visible solo si está habilitado */}
            {visibleCategorias[categoria] && (
              <div className="space-y-1 text-xs">
                {agrupaciones.map((a, i) => (
                  <div
                    key={`${categoria}-${a.agrupacion}`}
                    className="flex justify-between items-start sm:items-center text-xs flex-col sm:flex-row"
                  >
                    {/* Izquierda: número, logo, nombre */}
                    <div className="flex items-center gap-2 min-w-0 sm:w-3/4 w-full">
                      <span className="w-4 text-right shrink-0">{i + 1}.</span>
                      {a.logo && (
                        <img
                          src={a.logo}
                          alt={a.agrupacion}
                          className="w-5 h-5 rounded-sm object-contain shrink-0"
                        />
                      )}
                      <span
                        title={a.agrupacion}
                        className="truncate text-left overflow-hidden text-ellipsis"
                      >
                        {a.agrupacion}
                      </span>
                    </div>

                    {/* Derecha: votos */}
                    <div className="sm:w-1/4 w-full text-right text-muted-foreground whitespace-nowrap">
                      {a.votos} votos
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
