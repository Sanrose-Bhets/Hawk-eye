import apiClient from "@/lib/api-client"
import type { LoginRequest, LoginResponse, RefreshRequest } from "@/lib/types"

export async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data)
  return response.data
}

export async function refreshRequest(data: RefreshRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/refresh", data)
  return response.data
}
