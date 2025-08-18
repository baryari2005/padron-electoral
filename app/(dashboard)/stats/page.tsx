import StatsRecomputeForm from "./components/StatsRecomputeForm";

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl">Importar Padrón Electoral</h2>
      </div>
      <StatsRecomputeForm />
    </div>
  );
}