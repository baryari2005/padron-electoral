"use client"

import CircuiteSummaryPage from "./components/CircuiteSummaryPage";


export default function ReportsPage() {

  return (
    <div className="max-w-full">
      <h2 className="text-2xl mb-6">Informe de votos por circuito</h2>
      
      <CircuiteSummaryPage />
    </div>
  );
}
