// app/(dashboard)/components/GenericListWithTable/GenericListWithTable.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import axiosInstance from "@/utils/axios";

interface DataTableProps<T> {
  data: T[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  columns: ColumnDef<T, any>[];
  sorting: SortingState;
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
}

interface GenericListWithTableProps<T> {
  endpoint?: string;
  columns: ColumnDef<T, any>[];
  filters?: Record<string, any>;
  externalSearch: string;
  DataTableComponent: React.ComponentType<DataTableProps<T>>;
  pageSize?: number;
  refreshToken?: any;
  clientData?: T[];
}

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
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

  const [sorting, setSorting] = useState<SortingState>([]);
  const activeSort = sorting[0]; // puede ser undefined

  // búsqueda con debounce
  const [searchDraft, setSearchDraft] = useState(externalSearch);
  useEffect(() => setSearchDraft(externalSearch), [externalSearch]);
  const debouncedSearch = useDebounce(searchDraft, 350);

  const params = useMemo(() => ({
    search: debouncedSearch,
    page,
    limit: pageSize,
    ...(activeSort ? { sortBy: activeSort.id, sortDir: activeSort.desc ? "desc" : "asc" } : {}),
    ...(filters ?? {}),
  }), [debouncedSearch, page, pageSize, activeSort, filters]);

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

  useEffect(() => {
    setInternalSearch(externalSearch);
    setPage(1);
  }, [externalSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshToken]);

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
          setSearchDraft(val);
          setPage(1);
        }}
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting((old) => (typeof updater === "function" ? (updater as any)(old) : updater));
          setPage(1); // al cambiar sort, volvemos a la página 1
        }}
      />
    </div>
  );
}
