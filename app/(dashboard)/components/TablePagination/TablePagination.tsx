"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { ArrowBigLeft, ArrowBigLeftDash, ArrowBigRight, ArrowBigRightDash } from "lucide-react";
import { useState } from "react";

interface TablePaginationProps<T> {
  table: Table<T>;
}

export function TablePagination<T>({ table }: TablePaginationProps<T>) {
  const [page, setPage] = useState("");

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  const goToPage = () => {
    const pageNumber = Number(page);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= pageCount) {
      table.setPageIndex(pageNumber - 1);
      setPage("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 md:space-x-4 py-4">
      <div className="text-sm text-muted-foreground">
        Página <span className="font-semibold">{currentPage}</span> de{" "}
        <span className="font-semibold">{pageCount}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowBigLeftDash width={20} height={20}/> Primera
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowBigLeft width={20} height={20}/> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente <ArrowBigRight width={20} height={20}/>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          Última <ArrowBigRightDash width={20} height={20}/>
        </Button>

        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Ir a..."
            className="w-20 h-8"
          />
          <Button variant="outline" size="sm" onClick={goToPage}>
            Ir
          </Button>
        </div>
      </div>
    </div>
  );
}
