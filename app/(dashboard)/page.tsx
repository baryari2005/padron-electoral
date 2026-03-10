// app/(dashboard)/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;


import { getDashboardSummary } from "@/src/lib/server/dashboard";
import DashboardClient from "./DashboardClient";
import { getActiveElection } from "@/lib/elections/getActiveElection";
import { StatusPage } from "@/components/status/StatusPage";

export default async function DashboardPage() {
  const election = await getActiveElection();
  if (!election)
    return (
      <StatusPage
        code="403"
        title="Acceso denegado."
        description="Para acceder a esta sección tiene que existir una elección activa."
        imageSrc="/robot-nea.png"
        primaryAction={{ label: "Ir al inicio", href: "/" }}
      />
    );
  const data = await getDashboardSummary(election.id, election.tipo); // ✅ llamado directo, sin axios/fetch
  return <DashboardClient data={data} election={election} />;
}
