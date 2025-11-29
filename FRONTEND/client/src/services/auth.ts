import api from "@/lib/api";
import type { LoginReq, LoginRes, User } from "@shared/types";

export async function login(body: LoginReq): Promise<User> {
  const { data } = await api.post<LoginRes>("/auth/login", body);
  if (!data.success || !data.user) throw new Error(data.message || "Login gagal");
  if (data.token) localStorage.setItem("token", data.token);
  return data.user;
}

export function logout() { localStorage.removeItem("token"); }
