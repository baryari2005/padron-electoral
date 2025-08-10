"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "@/utils/axios";

interface GenericListWithTableProps<T> {
  endpoint?: string;
  columns: ColumnDef<T, any>[];
  filters?: Record<string, any>;
  externalSearch: string;
  DataTableComponent: React.ComponentType<{
    data: T[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearchChange: (query: string) => void;
    columns: ColumnDef<T, any>[];
  }>;
  pageSize?: number;
  refreshToken?: any;
  clientData?: T[];
}

export function GenericListWithTable<T>({
  endpoint,
  columns,
  filters,
  externalSearch,
  DataTableComponent,
  pageSize = 10,
  refreshToken,
  clientData,
}: GenericListWithTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [internalSearch, setInternalSearch] = useState(externalSearch);

  // Params estables para la request
  const params = useMemo(
    () => ({
      search: internalSearch,
      page,
      limit: pageSize,
      ...(filters ?? {}),
    }),
    [internalSearch, page, pageSize, filters]
  );

  // fetchData estable
  const fetchData = useCallback(async () => {
    if (clientData) {
      setData(clientData);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    if (!endpoint) return;

    setLoading(true);
    try {
      const res = await axiosInstance.get(endpoint, { params });
      setData(res.data.items ?? res.data.padron ?? []);
      const total = res.data.total ?? 0;
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error en GenericListWithTable:", error);
    } finally {
      setLoading(false);
    }
  }, [clientData, endpoint, params, pageSize]);

  // Sincroniza búsqueda externa → interna y resetea página
  useEffect(() => {
    setInternalSearch(externalSearch);
    setPage(1);
  }, [externalSearch]);

  // Carga de datos (o usa clientData si viene por props)
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshToken]); // refreshToken fuerza recarga cuando cambie

  return (
    <div className="mt-4 space-y-4">
      <DataTableComponent
        // key simplificado para evitar renders por stringify de filters
        key={`dt-${page}-${internalSearch}-${refreshToken ?? ""}`}
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
        onSearchChange={(val) => {
          setInternalSearch(val);
          setPage(1);
        }}
      />
    </div>
  );
}
