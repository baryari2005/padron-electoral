// components/Dashboard/DashboardRefreshBridge.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardRefreshBridge({ eventName = "dashboard:refresh" }) {
  const router = useRouter();
  useEffect(() => {
    const h = () => router.refresh();        // ← fuerza re-fetch de Server Components
    window.addEventListener(eventName, h);
    return () => window.removeEventListener(eventName, h);
  }, [eventName, router]);
  return null;
}
