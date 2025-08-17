"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useCategoryOrder() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/categories/order",
    fetcher,
    { fallbackData: [] }
  );
  return { categoryOrder: data ?? [], isLoading, error };
}