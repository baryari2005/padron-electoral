import { ElectoralRegistrerLoader } from "../components/ElectoralRegistrerLoader";

export default function ElectoralRollPage() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl">Importar Padrón Electoral</h2>
      </div>
      <ElectoralRegistrerLoader />
    </div>
  );
}
