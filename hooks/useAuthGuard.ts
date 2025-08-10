// hooks/useAuthGuard.ts
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAuthGuard({
  redirectTo,
  onlyWhenLoggedOut = false,
}: {
  redirectTo: string;
  onlyWhenLoggedOut?: boolean;
}) {
  const { user, loading, fetchUser, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hasHydrated) {
      fetchUser();
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || loading) return;

    const isLoggedIn = !!user;

    if (onlyWhenLoggedOut) {
      if (isLoggedIn && pathname === redirectTo) {
        router.replace("/");
      }
    } else {
      if (!isLoggedIn && pathname !== redirectTo) {
        router.replace(redirectTo);
      }
    }
  }, [hasHydrated, loading, user, redirectTo, pathname, onlyWhenLoggedOut]);

  return {
    isReady: hasHydrated && !loading,
    user,
  };
}
