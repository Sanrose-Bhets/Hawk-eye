import type { FloorPlan, ClassData, SeatAssignment } from '@/lib/types';
import apiClient from '@/lib/api-client';

// --- Floor Plans ---
export const floorPlanApi = {
  list: () => apiClient.get<FloorPlan[]>('/seat-plans/floor-plans'),
  get: (id: string) =>
    apiClient.get<FloorPlan>(`/seat-plans/floor-plans/${id}`),
  create: (data: {
    name: string;
    seats: { label: string; x: number; y: number }[];
    createdBy: string;
  }) => apiClient.post<FloorPlan>('/seat-plans/floor-plans', data),
  update: (
    id: string,
    data: { name?: string; seats?: { label: string; x: number; y: number }[] },
  ) => apiClient.put<FloorPlan>(`/seat-plans/floor-plans/${id}`, data),
  delete: (id: string) => apiClient.delete(`/seat-plans/floor-plans/${id}`),
};

// --- Classes ---
export const classApi = {
  list: () => apiClient.get<ClassData[]>('/seat-plans/classes'),
  get: (id: string) => apiClient.get<ClassData>(`/seat-plans/classes/${id}`),
  create: (data: {
    name: string;
    floorPlanId: string;
    assignments?: SeatAssignment[];
  }) => apiClient.post<ClassData>('/seat-plans/classes', data),
  update: (
    id: string,
    data: {
      name?: string;
      floorPlanId?: string;
      assignments?: SeatAssignment[];
    },
  ) => apiClient.put<ClassData>(`/seat-plans/classes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/seat-plans/classes/${id}`),
};
