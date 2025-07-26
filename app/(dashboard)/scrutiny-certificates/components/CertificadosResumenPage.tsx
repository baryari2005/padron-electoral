"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { School, ListChecks, TriangleAlert, ListCheck, Eye, MapPin, FileDiff, CheckCircle, PenIcon, Edit2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Link from "next/link";

interface MesaResumen {
  id: number;
  numero: string;
  createdAt: string;
  totalMesa?: {
    sobresEnUrna: number;
    electoresVotaron: number;
    diferencia: number;
  } | null;
  diferenciasPorCategoria?: {
    categoriaId: number;
    diferencia: number;
    categoria: {
      nombre: string;
    };
  }[];
}

interface EstablecimientoResumen {
  id: number;
  nombre: string;
  direccion: string;
  circuito: {
    nombre: string;
  };
  mesa: MesaResumen[];
}

export default function CertificadosResumenPage() {
  const [escuelas, setEscuelas] = useState<EstablecimientoResumen[]>([]);
  const [mesaIdSeleccionada, setMesaIdSeleccionada] = useState<number | null>(null);
  const [openFormulario, setOpenFormulario] = useState(false);

  function handleVerDetalle(id: number) {
    setMesaIdSeleccionada(id);
    setOpenFormulario(true);
  }

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await axios.get("/api/scrutiny-certificates/summary");
        console.log("Resumen recibido:", res.data);
        setEscuelas(res.data.items);
      } catch (err) {
        console.error("Error al cargar resumen de certificados", err);
      }
    };

    fetchResumen();
  }, []);

  const totalMesas = escuelas.reduce((acc, e) => acc + e.mesa.length, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Resumen de Carga de Certificados</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {escuelas.length} escuelas / {totalMesas} mesas cargadas
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {escuelas.map((escuela) => (
            <div key={escuela.id} className="space-y-2">
              <div className="font-semibold flex items-center gap-2 text-sm text-primary pb-3">
                <School className="w-4 h-4 text-primary" />
                {escuela.nombre} ({escuela.circuito.nombre})
                <div className="flex items-center pl-6 gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Dirección: {escuela.direccion}
                </div>
              </div>

              <div className="pl-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {escuela.mesa.map((m) => {
                  const diferencias = m.diferenciasPorCategoria ?? [];
                  const tieneDiferenciaTotal =
                    m.totalMesa?.diferencia !== 0;
                  const tieneDiferenciasCategoria =
                    diferencias.length > 0;

                  return (
                    <div
                      key={m.id}
                      className={clsx(
                        "border rounded-lg p-3 text-xs bg-gray-50",
                        (tieneDiferenciaTotal || tieneDiferenciasCategoria) ?
                          "border-red-400" : "border-green-400"
                      )}
                    >
                      <div className="flex items-center justify-between font-semibold text-primary mb-1">
                        <div className="flex items-center gap-1 text-sm">
                          Mesa {m.numero}
                          <span className="ml-1 text-muted-foreground text-xs">
                            Votantes: {m.totalMesa?.electoresVotaron ?? "-"} - Sobres:{" "}
                            {m.totalMesa?.sobresEnUrna ?? "-"}
                          </span>
                        </div>
                        {(tieneDiferenciaTotal || tieneDiferenciasCategoria) ? (<TriangleAlert className="w-5 h-5 text-red-600 " />) : (<CheckCircle className="w-5 h-5 text-green-600 " />)}
                      </div>

                      {diferencias.map((d) => (
                        <div key={d.categoriaId} >
                          <div className="mt-2 text-muted-foreground ml-2 flex">
                            <FileDiff className="w-4 h-4 mr-2" />
                            Total boletas de {d.categoria.nombre.toLocaleLowerCase()}:{" "}
                            {m.totalMesa ? m.totalMesa.sobresEnUrna + (d.diferencia * -1) : "-"}
                          </div>
                        </div>
                      ))}

                      <div className="mt-3">
                        <Link href={`/scrutiny-certificates/${m.id}/edit`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs w-full"
                          >
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
        </CardContent>
      </Card>
    </div>
  );
}
