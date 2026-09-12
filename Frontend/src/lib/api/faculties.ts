import apiClient from '@/lib/api-client';
import type { Faculty } from '@/lib/types';

export const facultyApi = {
  list: () => apiClient.get<{ data: Faculty[] }>('/faculties?limit=100'),
};
