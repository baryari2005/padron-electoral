import { redirect } from "next/navigation";

async function getSystemState() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/elections/active`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getSystemState();

  if (!data.active) {
    redirect("/bootstrap");
  }

  return <>{children}</>;
}