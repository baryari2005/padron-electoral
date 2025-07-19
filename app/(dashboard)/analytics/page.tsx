import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CompaniesChart } from "./components/CompaniesChart";

export default async function PageAnalytics() {
  const { userId } = auth();
  if (!userId) return redirect("/");

  return (
    <div className="p-4 bg-background shadow-md rounded-lg">
      <h2 className="text-2xl mb-4">Analytics Page</h2>
      <CompaniesChart />
    </div>
  );
}
