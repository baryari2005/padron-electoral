import axios from "axios";
import { toast } from "sonner"; // o el sistema de notificaciones que uses
import router from "next/router"; // si querés redirigir en errores

console.log("🧩 API BASE URL:", process.env.NEXT_PUBLIC_API_BASE);

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "",
});

// ✅ Interceptor para agregar token
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Interceptor de respuestas para manejar errores globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = error.config?.url;

    // ⚠️ Si el error viene del login, dejamos que el componente lo maneje
    const isLoginRequest = path?.includes("/api/app-auth/login");

    if (status === 401 && !isLoginRequest) {
      toast.error("Sesión expirada. Iniciá sesión nuevamente.");
      localStorage.removeItem("token");
      router.push("/sign-in");
    }

    // if (status === 403) {
    //   toast.error("No tenés permisos para realizar esta acción.");
    // }

    if (status === 500) {
      toast.error("Error del servidor. Intentalo más tarde.");
    }

    return Promise.reject(error); // 🔁 deja que el componente lo maneje
  }
);

export default axiosInstance;
