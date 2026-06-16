import api from "@/lib/api";
import type { User, UserRole } from "@shared/types";

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export const usersService = {
  getUsers: (params?: UserListParams) =>
    api.get<UserListResponse>("/users", { params }),

  getUser: (id: string) => api.get<User>(`/users/${id}`),

  createUser: (data: CreateUserRequest) =>
    api.post<User>("/users", data),

  updateUser: (id: string, data: UpdateUserRequest) =>
    api.patch<User>(`/users/${id}`, data),

  deleteUser: (id: string) => api.delete<void>(`/users/${id}`),
};

export default usersService;
