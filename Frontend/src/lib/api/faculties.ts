import apiClient from '@/lib/api-client';
import type { Faculty, PaginatedResponse } from '@/lib/types';

export interface ListFacultiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateFacultyData {
  name: string;
  description?: string;
}

export type UpdateFacultyData = Partial<CreateFacultyData>;

export const facultyApi = {
  list: (params: ListFacultiesParams = {}) =>
    apiClient.get<PaginatedResponse<Faculty>>('/faculties', { params }),

  create: (data: CreateFacultyData) =>
    apiClient.post<Faculty>('/faculties', data),

  update: (id: string, data: UpdateFacultyData) =>
    apiClient.put<Faculty>(`/faculties/${id}`, data),

  delete: (id: string) => apiClient.delete(`/faculties/${id}`),
};
