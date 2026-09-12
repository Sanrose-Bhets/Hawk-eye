import apiClient from '@/lib/api-client';
import type { Module, PaginatedResponse } from '@/lib/types';

export interface ListModulesParams {
  page?: number;
  limit?: number;
  search?: string;
  faculty?: string;
}

export interface CreateModuleData {
  name: string;
  code?: string;
  moduleLeader: string;
  facultyId: string;
}

export type UpdateModuleData = Partial<CreateModuleData>;

export const moduleApi = {
  list: (params: ListModulesParams = {}) =>
    apiClient.get<PaginatedResponse<Module>>('/modules', { params }),

  get: (id: string) => apiClient.get<Module>(`/modules/${id}`),

  create: (data: CreateModuleData) => apiClient.post<Module>('/modules', data),

  update: (id: string, data: UpdateModuleData) =>
    apiClient.put<Module>(`/modules/${id}`, data),

  delete: (id: string) => apiClient.delete(`/modules/${id}`),
};
