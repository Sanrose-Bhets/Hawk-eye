import apiClient from '@/lib/api-client';
import type { Student, PaginatedResponse } from '@/lib/types';

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  faculty?: string;
}

export interface CreateStudentData {
  name: string;
  email: string;
  address: string;
  contact: string;
  parentEmail: string;
  facultyId?: string;
}

export type UpdateStudentData = Partial<
  Omit<CreateStudentData, 'password'> & { password: string }
>;

export interface ImportError {
  email: string;
  reason: string;
}

export interface ImportResponse {
  created: number;
  errors: ImportError[];
}

export const studentApi = {
  list: (params: ListStudentsParams = {}) =>
    apiClient.get<PaginatedResponse<Student>>('/students', { params }),

  get: (id: string) => apiClient.get<Student>(`/students/${id}`),

  create: (data: CreateStudentData) =>
    apiClient.post<Student>('/students', data),

  update: (id: string, data: UpdateStudentData) =>
    apiClient.put<Student>(`/students/${id}`, data),

  delete: (id: string) => apiClient.delete(`/students/${id}`),

  import: (students: CreateStudentData[]) =>
    apiClient.post<ImportResponse>('/students/import', { students }),

  getImageUrl: (id: string) =>
    apiClient.get<{ url: string }>(`/students/${id}/image`),

  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<Student>(`/students/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
