// app/(dashboard)/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;


import { getDashboardSummary } from "@/src/lib/server/dashboard";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const data = await getDashboardSummary(); // ✅ llamado directo, sin axios/fetch
  return <DashboardClient data={data} />;
}
