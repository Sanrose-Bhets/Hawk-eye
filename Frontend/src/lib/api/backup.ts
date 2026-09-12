import apiClient from '@/lib/api-client';

export interface BackupPreview {
  students: number;
  faculties: number;
  modules: number;
  results: number;
  resultItems: number;
  floorPlans: number;
  classes: number;
  examRoutines: number;
  calendarNotes: number;
  emailLogs: number;
}

export interface ImportResult {
  imported: Record<string, number>;
}

export const backupApi = {
  async preview(): Promise<BackupPreview> {
    const { data } = await apiClient.get<BackupPreview>('/backup/preview');
    return data;
  },

  async exportBackup(): Promise<void> {
    const response = await apiClient.get('/backup/export', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async importBackup(payload: {
    version: string;
    exportedAt: string;
    data: Record<string, unknown[]>;
  }): Promise<ImportResult> {
    const { data } = await apiClient.post<ImportResult>(
      '/backup/import',
      payload,
    );
    return data;
  },
};
