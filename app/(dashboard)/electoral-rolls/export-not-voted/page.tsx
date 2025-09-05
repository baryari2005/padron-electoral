import ExportNoVotaronPage from "./components/ExportNotVoted";

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl">Exportar Padrón Electoral - Ausentes</h2>
      </div>
      <ExportNoVotaronPage />
    </div>
  );
}