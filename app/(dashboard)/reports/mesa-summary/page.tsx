"use client"

import MesaSummaryPage from "./components/MesaSummaryPage";


export default function ReportsPage() {
  
  return (
    <div className="max-w-full "> {/* font-sans opcional */}
      <h2 className="text-2xl mb-6">Informes de votos por mesas</h2>

      <MesaSummaryPage/>
    </div>
  );
}