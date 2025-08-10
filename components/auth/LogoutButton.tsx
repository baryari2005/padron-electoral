"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/auth";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    const logout = useAuthStore.getState().logout;
    logout();
    router.push("/sign-in");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
}