"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowBigLeft,
  ArrowBigLeftDash,
  ArrowBigRight,
  ArrowBigRightDash,
} from "lucide-react";

interface TablePaginationToDBProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePaginationToDB({
  page,
  totalPages,
  onPageChange,
}: TablePaginationToDBProps) {
  const [goTo, setGoTo] = useState("");

  const parsedGoTo = Number(goTo);

  const handleGo = () => {
    if (!isNaN(parsedGoTo) && parsedGoTo >= 1 && parsedGoTo <= totalPages) {
      onPageChange(parsedGoTo);
      setGoTo("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 md:space-x-4 py-4">
      <div className="text-sm text-muted-foreground">
        Página <span className="font-semibold">{page}</span> de{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ArrowBigLeftDash className="w-4 h-4 mr-1" />
          Primera
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ArrowBigLeft className="w-4 h-4 mr-1" />
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Siguiente
          <ArrowBigRight className="w-4 h-4 ml-1" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          Última
          <ArrowBigRightDash className="w-4 h-4 ml-1" />
        </Button>

        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={goTo}
            onChange={(e) => setGoTo(e.target.value)}
            placeholder="Ir a..."
            className="w-20 h-8"
          />
          <Button variant="outline" size="sm" onClick={handleGo}>
            Ir
          </Button>
        </div>
      </div>
    </div>
  );
}
