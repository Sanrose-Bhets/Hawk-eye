import apiClient from '@/lib/api-client';
import type { EmailLog, MailStats, PaginatedResponse } from '@/lib/types';

export interface ListMailLogsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface SendMailData {
  studentId: string;
  subject: string;
  body: string;
}

export interface SendBulkMailData {
  studentIds: string[];
  subject: string;
  body: string;
}

export interface SendMailResponse {
  id: string;
  status: string;
  message: string;
}

export interface BulkSendResponse {
  queued: number;
  errors: { studentId: string; reason: string }[];
}

export const mailApi = {
  send: (data: SendMailData) =>
    apiClient.post<SendMailResponse>('/mail/send', data),

  sendBulk: (data: SendBulkMailData) =>
    apiClient.post<BulkSendResponse>('/mail/send-bulk', data),

  listLogs: (params: ListMailLogsParams = {}) =>
    apiClient.get<PaginatedResponse<EmailLog>>('/mail/logs', { params }),

  getStats: () => apiClient.get<MailStats>('/mail/stats'),
};
