'use client';

import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { pacifico, firmaFont } from "@/app/lib/fonts";
import { AuthRehydrationProvider } from "./components";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isReady, user } = useAuthGuard({ redirectTo: "/sign-in" });
  if (!isReady) return <AuthRehydrationProvider />;

  if (!user) return null;

  return (
    <div className={`flex w-full h-full ${pacifico.variable} ${firmaFont.variable}`}>
      <div className="hidden xl:block w-80 h-full xl:fixed">
        <Sidebar />
      </div>
      <div className="w-full xl:ml-80">
        <Navbar user={user} />
        <div className="p-6 bg-[#fafbfc] dark:bg-secondary min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
