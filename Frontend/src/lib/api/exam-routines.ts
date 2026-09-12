import apiClient from '@/lib/api-client';
import type { ExamRoutine } from '@/lib/types';

export interface CreateExamRoutineData {
  date: string;
  startTime: string;
  endTime: string;
  facultyId: string;
  moduleId: string;
}

export type UpdateExamRoutineData = Partial<CreateExamRoutineData>;

export const examRoutineApi = {
  list: (params?: { month?: number; year?: number }) =>
    apiClient.get<ExamRoutine[]>('/exam-routines', { params }),

  calendar: (params?: { month?: number; year?: number }) =>
    apiClient.get<ExamRoutine[]>('/exam-routines', { params }),

  studentList: (params?: { month?: number; year?: number }) =>
    apiClient.get<ExamRoutine[]>('/exam-routines/student', { params }),

  get: (id: string) => apiClient.get<ExamRoutine>(`/exam-routines/${id}`),

  create: (data: CreateExamRoutineData) =>
    apiClient.post<ExamRoutine>('/exam-routines', data),

  update: (id: string, data: UpdateExamRoutineData) =>
    apiClient.put<ExamRoutine>(`/exam-routines/${id}`, data),

  delete: (id: string) => apiClient.delete(`/exam-routines/${id}`),
};
