import axiosInstance from "@/utils/axios";
import type { LoginValues } from "../schemas/login.schema";

type LoginResponse = { token?: string };

export async function login(values: LoginValues): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>("/api/app-auth/login", values);
  return data;
}
