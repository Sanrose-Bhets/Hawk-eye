export type Role = 'STUDENT' | 'STUDENT_SERVICE' | 'RTE';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

export interface SeatPosition {
  label: string;
  x: number;
  y: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  seats: SeatPosition[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeatAssignment {
  seatIndex: number;
  studentName: string;
  studentEmail: string;
}

export interface ClassData {
  id: string;
  name: string;
  floorPlanId: string;
  assignments: SeatAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface DummyStudent {
  id: string;
  name: string;
  email: string;
}
