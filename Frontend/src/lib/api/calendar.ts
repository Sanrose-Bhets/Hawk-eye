import apiClient from '@/lib/api-client';
import type { CalendarNote } from '@/lib/types';

export interface CreateCalendarNoteData {
  date: string;
  title: string;
  content?: string;
}

export interface UpdateCalendarNoteData {
  date?: string;
  title?: string;
  content?: string;
}

export const calendarApi = {
  list: (params?: { month?: number; year?: number }) =>
    apiClient.get<CalendarNote[]>('/calendar-notes', { params }),

  get: (id: string) => apiClient.get<CalendarNote>(`/calendar-notes/${id}`),

  create: (data: CreateCalendarNoteData) =>
    apiClient.post<CalendarNote>('/calendar-notes', data),

  update: (id: string, data: UpdateCalendarNoteData) =>
    apiClient.put<CalendarNote>(`/calendar-notes/${id}`, data),

  delete: (id: string) => apiClient.delete(`/calendar-notes/${id}`),
};
