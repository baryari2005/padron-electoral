"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  // otros campos si querés
}

export function useAuthRedirect() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Usamos SIEMPRE la misma clave

    if (!token) {
      setLoading(false);
      router.push("/sign-in"); // Redirige si no hay token
      return;
    }
    
    fetch("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No autorizado");

        const data = await res.json();

        const userData = data.user;
        if (!userData.avatarUrl && userData.name) {
          const userName = userData.name + " " + userData.lastName;

          userData.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=404040&color=fff&size=128&rounded=true&bold=true`;
        }
        setUser(userData); // Espera { user: {...} }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token"); // ⚠️ CORREGIDO
        setLoading(false);
        router.push("/sign-in"); // ⚠️ CORREGIDO
      });
  }, [router]);

  return { loading, user };
}
