// src/features/scrutiny-certificates/components/CertificatesSummaryList/CertificatesSummaryList.tsx
"use client";

import Link from "next/link";
import clsx from "clsx";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  School,
  TriangleAlert,
  CheckCircle,
  FileDiff,
  MapPin,
  Edit3,
} from "lucide-react";

type MesaResumen = {
  id: number;
  numero: string;
  createdAt?: string;
  totalMesa?: {
    sobresEnUrna: number;
    electoresVotaron: number;
    diferencia: number;
  } | null;
  diferenciasPorCategoria?: {
    categoriaId: number;
    diferencia: number;
    categoria: { nombre: string };
  }[];
};

type EstablecimientoResumen = {
  id: number;
  nombre: string;
  direccion: string;
  // si no viene, podés pasar _circuitoNombre desde la página
  _circuitoNombre?: string;
  circuito?: { nombre?: string };
  mesa: MesaResumen[];
};

type Props = {
  escuelas: EstablecimientoResumen[];
};

export function CertificatesSummaryList({ escuelas }: Props) {
  if (!escuelas?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay resultados para los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {escuelas.map((escuela) => (
        <div key={escuela.id} className="space-y-2">
          {/* Encabezado de escuela */}
          <div className="font-semibold flex items-center gap-2 text-sm text-primary pb-3">
            <School className="w-4 h-4 text-primary" />
            {escuela.nombre} ({escuela._circuitoNombre ?? escuela.circuito?.nombre ?? "—"})
            <div className="flex items-center pl-6 gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Dirección: {escuela.direccion}
            </div>
          </div>

          {/* Tarjetas de mesas */}
          <div className="pl-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {escuela.mesa.map((m) => {
              const diferencias = m.diferenciasPorCategoria ?? [];
              const tieneDiferenciaTotal = (m.totalMesa?.diferencia ?? 0) !== 0;
              const tieneDiferenciasCategoria = diferencias.length > 0;

              return (
                <div
                  key={m.id}
                  className={clsx(
                    "border rounded-lg p-3 text-xs bg-gray-50",
                    (tieneDiferenciaTotal || tieneDiferenciasCategoria)
                      ? "border-red-400"
                      : "border-green-400"
                  )}
                >
                  <div className="flex items-center justify-between font-semibold text-primary mb-1">
                    <div className="flex items-center gap-1 text-sm">
                      Mesa {m.numero}
                      <span className="ml-1 text-muted-foreground text-xs">
                        Votantes: {m.totalMesa?.electoresVotaron ?? "-"} — Sobres:{" "}
                        {m.totalMesa?.sobresEnUrna ?? "-"}
                      </span>
                    </div>
                    {(tieneDiferenciaTotal || tieneDiferenciasCategoria) ? (
                      <TriangleAlert className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  {/* Detalle de diferencias por categoría */}
                  {diferencias.map((d) => (
                    <div key={d.categoriaId}>
                      <div className="mt-2 text-muted-foreground ml-2 flex">
                        <FileDiff className="w-4 h-4 mr-2" />
                        Total boletas de {d.categoria.nombre.toLocaleLowerCase()}:{" "}
                        {m.totalMesa
                          ? m.totalMesa.sobresEnUrna + d.diferencia * -1
                          : "-"}
                      </div>
                    </div>
                  ))}

                  <div className="mt-3">
                    <Link href={`/scrutiny-certificates/${m.id}/edit`}>
                      <Button size="sm" variant="outline" className="text-xs w-full">
                        <Edit3 className="w-4 h-4 mr-1" />
                        Editar certificado
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-2" />
        </div>
      ))}
    </div>
  );
}
