import apiClient from '@/lib/api-client';
import type { Teacher, PaginatedResponse } from '@/lib/types';

export interface ListTeachersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  facultyIds?: string[];
  moduleIds?: string[];
}

export type UpdateTeacherData = Partial<CreateTeacherData>;

export const teacherApi = {
  list: (params: ListTeachersParams = {}) =>
    apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params }),

  get: (id: string) => apiClient.get<Teacher>(`/teachers/${id}`),

  create: (data: CreateTeacherData) =>
    apiClient.post<Teacher>('/teachers', data),

  update: (id: string, data: UpdateTeacherData) =>
    apiClient.put<Teacher>(`/teachers/${id}`, data),

  delete: (id: string) => apiClient.delete(`/teachers/${id}`),
};
