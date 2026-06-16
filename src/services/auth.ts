import api from "@/lib/api";
import type { User } from "@shared/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: User["role"];
}

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<LoginResponse>("/auth/register", data),

  logout: () => api.post<void>("/auth/logout"),

  getCurrentUser: () => api.get<User>("/auth/me"),
};

export default authService;
