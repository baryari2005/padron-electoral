'use client';

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AuthRehydrationProvider } from "@/app/(dashboard)/components";

export default function LayoutAuth({ children }: { children: React.ReactNode }) {
  const { isReady, user } = useAuthGuard({
    redirectTo: "/sign-in",
    onlyWhenLoggedOut: true,
  });

  if (!isReady) return <AuthRehydrationProvider />;
  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      {children}
    </div>
  );
}
