"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import axiosInstance from "@/utils/axios";

interface GenericListWithTableProps<T> {
  endpoint: string;
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
}

export function GenericListWithTable<T>({
  endpoint,
  columns,
  filters,
  externalSearch,
  DataTableComponent,
  pageSize = 10,
  refreshToken,
}: GenericListWithTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [internalSearch, setInternalSearch] = useState(externalSearch);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(endpoint, {
        params: {
          search: internalSearch,
          page,
          limit: pageSize,
          ...filters,
        },
      });

      setData(res.data.items ?? res.data.padron ?? []);
      const total = res.data.total ?? 0;
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error en GenericListWithTable:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInternalSearch(externalSearch);
    setPage(1);
  }, [externalSearch]);

  useEffect(() => {
    fetchData();
  }, [internalSearch, page, filters, refreshToken]);

  return (
    <div className="mt-4 space-y-4">
      <DataTableComponent
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
