"use client"

import EstablishmentSummaryPage from "./components/EstablishmentSummaryPage";


export default function ReportsPage() {

  return (
    <div className="max-w-full">
      <h2 className="text-2xl mb-6">Informe de votos por establecimiento</h2>
      
      <EstablishmentSummaryPage />
    </div>
  );
}
