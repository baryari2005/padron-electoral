// // utils/axios.ts
// import axios, { AxiosHeaders } from "axios";

// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "",
//   withCredentials: true,
// });

// async function notifyError(message: string) {
//   if (typeof window === "undefined") return;
//   try {
//     const { toast } = await import("sonner");
//     toast.error(message);
//   } catch {}
// }

// axiosInstance.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token");
//     if (token) {
//       // ✅ Soporta Axios v1 (AxiosHeaders) y objetos planos
//       if (config.headers && typeof (config.headers as any).set === "function") {
//         (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
//       } else {
//         config.headers = {
//           ...(config.headers ?? {}),
//           Authorization: `Bearer ${token}`,
//         } as any;
//       }
//     }
//   }
//   return config;
// });

// axiosInstance.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const status = error?.response?.status as number | undefined;
//     const path = error?.config?.url as string | undefined;
//     const isLoginRequest = path?.includes("/api/app-auth/login");

//     if (typeof window !== "undefined") {
//       if (status === 401 && !isLoginRequest) {
//         await notifyError("Sesión expirada. Iniciá sesión nuevamente.");
//         try { localStorage.removeItem("token"); } catch {}
//         window.location.replace("/sign-in");
//       } else if (status === 500) {
//         await notifyError("Error del servidor. Intentalo más tarde.");
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
