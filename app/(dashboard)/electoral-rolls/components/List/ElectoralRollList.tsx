"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { columns } from "./columns";
import { PadronElectoral } from "@prisma/client";
import { DataTable } from "./data-table";

interface ElectoralRollWithRelations extends PadronElectoral {
  establecimiento: { nombre: string };
  circuito: { nombre: string };
}

interface Props {
  search: string;
  filters: {
    localidad?: string;
    circuitoId?: number;
    establecimientoId?: number;
  };
  onDeleted?: () => void;
  refresh?: boolean;
}

export function ElectoralRollList({ search, filters, onDeleted, refresh }: Props) {
  const [data, setData] = useState<ElectoralRollWithRelations[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const [internalSearch, setInternalSearch] = useState(search);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/electoral-rolls", {
        params: {
          search: internalSearch,
          page,
          limit,
          ...filters,
        },
      });

      setData(res.data.padron);
      const totalItems = res.data.total || 0;
      setTotalPages(Math.ceil(totalItems / limit));
    } catch (error: any) {
      console.error("Error al obtener el padrón:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza la búsqueda externa al cambiar `search` (desde el Page)
  useEffect(() => {
    setPage(1);
    setInternalSearch(search);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [internalSearch, page, filters, refresh]);

  return (
    <div className="mt-4 space-y-4">
      <DataTable
        columns={columns({ onDeleted })}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        onSearchChange={(val) => {
          setInternalSearch(val);
          setPage(1); // Reiniciar paginación al buscar
        }}
      />
    </div>
  );
}
