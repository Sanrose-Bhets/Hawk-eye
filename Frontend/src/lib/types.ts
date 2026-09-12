export type Role = 'STUDENT' | 'STUDENT_SERVICE' | 'RTE';

export interface User {
  id: string;
  email: string;
  role: Role;
  facultyId?: string | null;
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

export interface Student {
  id: string;
  name: string;
  email: string;
  address: string;
  contact: string;
  parentEmail: string;
  image: string | null;
  role: string;
  facultyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Faculty {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  code: string | null;
  moduleLeader: string;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResultItem {
  id: string;
  moduleId: string;
  moduleName: string;
  moduleCode: string | null;
  score: number;
  grade: string;
  createdAt: string;
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  published: boolean;
  items: ResultItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  studentId: string | null;
  status: string;
  error: string | null;
  createdAt: string;
}

export interface MailStats {
  totalSent: number;
  totalQueued: number;
  totalFailed: number;
}

export interface CalendarNote {
  id: string;
  rteId: string;
  date: string;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamRoutine {
  id: string;
  rteId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  facultyId: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
}
