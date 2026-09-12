import apiClient from '@/lib/api-client';
import type { ClassBooking } from '@/lib/types';

export interface CreateBookingData {
  classId: string;
  purpose: string;
  durationMinutes: number;
}

export const classBookingApi = {
  list: (filters?: { classId?: string; isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const qs = params.toString();
    return apiClient.get<ClassBooking[]>(`/class-bookings${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => apiClient.get<ClassBooking>(`/class-bookings/${id}`),
  create: (data: CreateBookingData) => apiClient.post<ClassBooking>('/class-bookings', data),
  free: (id: string) => apiClient.patch<ClassBooking>(`/class-bookings/${id}/free`),
};
