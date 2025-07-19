import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  data: any[];
}

export function ExportToExcelButton({ data }: ExportButtonProps) {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Padron");

    XLSX.writeFile(wb, "padron-electoral.xlsx");
  };

  return (
    <Button onClick={handleExport} variant="outline">
      Exportar a Excel
    </Button>
  );
}