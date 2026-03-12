"use client";

import { useState } from "react";
import { useActiveElection } from "@/hooks/useActiveElection";
import { StatusPage } from "@/components/status/StatusPage";
import { useParams, useSearchParams } from "next/navigation";
import { ActorList } from "../components/ActorList";

export default function ReferenteDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const referenteId = String(params.id ?? "");
  const referenteNombre = searchParams.get("name") ?? "Referente";

  const [refresh, setRefresh] = useState(false);
  const [search, setSearch] = useState("");

  const components = "Electores";

  const { loading, hasActive } = useActiveElection();

  const handleRefresh = () => setRefresh((prev) => !prev);

  if (loading) return null;

  if (!hasActive) {
    return (
      <StatusPage
        code="403"
        title="Acceso denegado."
        description="Para acceder a esta sección tiene que existir una elección activa."
        imageSrc="/robot-nea.png"
        primaryAction={{ label: "Ir al inicio", href: "/" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">
          Listado de {components} asociados a {referenteNombre}
        </h2>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <ActorList
          key={`${referenteId}-${String(refresh)}-${search}`}
          referenteId={referenteId}
          search={search}
          onDeleted={handleRefresh}
          refresh={refresh}
        />
      </div>
    </div>
  );
}