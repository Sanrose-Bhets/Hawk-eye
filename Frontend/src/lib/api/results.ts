import apiClient from '@/lib/api-client';
import type { Result, PaginatedResponse } from '@/lib/types';

export interface ListResultsParams {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
  published?: string;
}

export interface CreateResultItemData {
  moduleId: string;
  score: number;
}

export interface CreateResultData {
  studentId: string;
  items: CreateResultItemData[];
}

export type UpdateResultData = {
  items: CreateResultItemData[];
};

export interface ImportResultItemData {
  studentEmail: string;
  moduleCode: string;
  score: number;
}

export interface ImportError {
  studentEmail: string;
  moduleCode: string;
  reason: string;
}

export interface ImportResponse {
  created: number;
  errors: ImportError[];
}

export const resultApi = {
  list: (params: ListResultsParams = {}) =>
    apiClient.get<PaginatedResponse<Result>>('/results', { params }),

  get: (id: string) => apiClient.get<Result>(`/results/${id}`),

  create: (data: CreateResultData) => apiClient.post<Result>('/results', data),

  update: (id: string, data: UpdateResultData) =>
    apiClient.put<Result>(`/results/${id}`, data),

  delete: (id: string) => apiClient.delete(`/results/${id}`),

  import: (items: ImportResultItemData[]) =>
    apiClient.post<ImportResponse>('/results/import', { items }),

  publish: (id: string, published: boolean) =>
    apiClient.put<Result>(`/results/${id}/publish`, { published }),
};
