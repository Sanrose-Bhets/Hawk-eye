import apiClient from '@/lib/api-client';
import type { AdmitCard } from '@/lib/types';

export interface GenerateBulkData {
  facultyId: string;
  semester: number;
  classId?: string;
}

export const admitCardApi = {
  generateBulk: (data: GenerateBulkData) =>
    apiClient.post<{ generated: number; skipped: number; errors: string[] }>(
      '/admit-cards/generate',
      data,
    ),

  generateSingle: (studentId: string, classId?: string) =>
    apiClient.post<AdmitCard[]>(`/admit-cards/generate/${studentId}`, null, {
      params: classId ? { classId } : undefined,
    }),

  list: () => apiClient.get<AdmitCard[]>('/admit-cards'),

  get: (id: string) => apiClient.get<AdmitCard>(`/admit-cards/${id}`),

  getMyCards: () => apiClient.get<AdmitCard[]>('/admit-cards/student/me'),

  getPdfUrl: (id: string) =>
    apiClient.get(`/admit-cards/${id}/pdf`, { responseType: 'blob' }),

  delete: (id: string) => apiClient.delete(`/admit-cards/${id}`),
};
