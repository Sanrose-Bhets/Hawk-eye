import type { FloorPlan, ClassData, SeatAssignment, DummyStudent } from "@/lib/types"
import apiClient from "@/lib/api-client"

// --- Dummy Students ---
export const DUMMY_STUDENTS: DummyStudent[] = [
  { id: "1", name: "Aarav Sharma", email: "aarav@example.com" },
  { id: "2", name: "Aisha Patel", email: "aisha@example.com" },
  { id: "3", name: "Anil Kumar", email: "anil@example.com" },
  { id: "4", name: "Bikash Thapa", email: "bikash@example.com" },
  { id: "5", name: "Charlie Gurung", email: "charlie@example.com" },
  { id: "6", name: "Diya Magar", email: "diya@example.com" },
  { id: "7", name: "Farhan Ali", email: "farhan@example.com" },
  { id: "8", name: "Gita Devi", email: "gita@example.com" },
  { id: "9", name: "Hari Prasad", email: "hari@example.com" },
  { id: "10", name: "Indra Bahadur", email: "indra@example.com" },
  { id: "11", name: "Jaya Mishra", email: "jaya@example.com" },
  { id: "12", name: "Kiran Rai", email: "kiran@example.com" },
  { id: "13", name: "Laxmi Shrestha", email: "laxmi@example.com" },
  { id: "14", name: "Manish Tamang", email: "manish@example.com" },
  { id: "15", name: "Nisha Ghimire", email: "nisha@example.com" },
  { id: "16", name: "Ojas Maharjan", email: "ojas@example.com" },
  { id: "17", name: "Prakash Adhikari", email: "prakash@example.com" },
  { id: "18", name: "Queen Karki", email: "queen@example.com" },
  { id: "19", name: "Rajan Bhattarai", email: "rajan@example.com" },
  { id: "20", name: "Sunita Karki", email: "sunita@example.com" },
]

// --- Floor Plans ---
export const floorPlanApi = {
  list: () => apiClient.get<FloorPlan[]>("/seat-plans/floor-plans"),
  get: (id: string) => apiClient.get<FloorPlan>(`/seat-plans/floor-plans/${id}`),
  create: (data: { name: string; seats: { label: string; x: number; y: number }[]; createdBy: string }) =>
    apiClient.post<FloorPlan>("/seat-plans/floor-plans", data),
  update: (id: string, data: { name?: string; seats?: { label: string; x: number; y: number }[] }) =>
    apiClient.put<FloorPlan>(`/seat-plans/floor-plans/${id}`, data),
  delete: (id: string) => apiClient.delete(`/seat-plans/floor-plans/${id}`),
}

// --- Classes ---
export const classApi = {
  list: () => apiClient.get<ClassData[]>("/seat-plans/classes"),
  get: (id: string) => apiClient.get<ClassData>(`/seat-plans/classes/${id}`),
  create: (data: { name: string; floorPlanId: string; assignments?: SeatAssignment[] }) =>
    apiClient.post<ClassData>("/seat-plans/classes", data),
  update: (id: string, data: { name?: string; floorPlanId?: string; assignments?: SeatAssignment[] }) =>
    apiClient.put<ClassData>(`/seat-plans/classes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/seat-plans/classes/${id}`),
}

// --- Student Search ---
export function searchStudents(query: string): DummyStudent[] {
  if (!query.trim()) return DUMMY_STUDENTS
  const q = query.toLowerCase()
  return DUMMY_STUDENTS.filter(
    (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
  )
}
