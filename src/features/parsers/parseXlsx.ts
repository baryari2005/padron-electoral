import { read, utils } from "xlsx";
import { ElectoralXlsxRow } from "../electoral-rolls/types";

/** Parsea el primer sheet del buffer XLSX a JSON tipado */
export function parseXlsxToRows(buffer: Buffer): ElectoralXlsxRow[] {
  const workbook = read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // raw:true evita casteos raros de fechas; defval:"" rellena vacíos
  const rows = utils.sheet_to_json<ElectoralXlsxRow>(sheet, { raw: true, defval: "" });
  return rows;
}
