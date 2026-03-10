import type { Metadata } from "next";
import SpreadsheetEditClient from "./spreadsheet-edit-client";

export const metadata: Metadata = {
  title: "Editar Planilla",
};

export default function Page({ params }: { params: { id: string } }) {
  return <SpreadsheetEditClient id={params.id} />;
}