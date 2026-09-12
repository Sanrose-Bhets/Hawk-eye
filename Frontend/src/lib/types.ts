export type Role = "STUDENT" | "STUDENT_SERVICE" | "RTE"

export interface User {
  id: string
  email: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
}
