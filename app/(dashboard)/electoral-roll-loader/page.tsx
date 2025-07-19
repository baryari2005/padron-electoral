import { ElectoralRegistrerLoader } from "../components/ElectoralRegistrerLoader";


export default function ElectoralRollPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Importar Padrón Electoral</h1>
      <ElectoralRegistrerLoader />
      <hr />      
    </main>
  );
}
