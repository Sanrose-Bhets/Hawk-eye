import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  Upload,
  Database,
  Users,
  BookOpen,
  Award,
  LayoutGrid,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  Mail,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { backupApi, type BackupPreview } from '@/lib/api/backup';

const ENTITY_ICONS: Record<string, React.ElementType> = {
  students: Users,
  faculties: BookOpen,
  modules: BookOpen,
  results: Award,
  resultItems: Award,
  floorPlans: LayoutGrid,
  classes: GraduationCap,
  examRoutines: ClipboardList,
  calendarNotes: CalendarDays,
  emailLogs: Mail,
};

const ENTITY_LABELS: Record<string, string> = {
  students: 'Students',
  faculties: 'Faculties',
  modules: 'Modules',
  results: 'Results',
  resultItems: 'Result Items',
  floorPlans: 'Floor Plans',
  classes: 'Classes',
  examRoutines: 'Exam Routines',
  calendarNotes: 'Calendar Notes',
  emailLogs: 'Email Logs',
};

export default function BackupPage() {
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Record<
    string,
    unknown[]
  > | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<Record<
    string,
    number
  > | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await backupApi.preview();
      setPreview(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load preview';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await backupApi.exportBackup();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (!json.data) {
          setError('Invalid backup file: missing data field');
          return;
        }
        setImportPreview(json.data);
      } catch {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string);
          const result = await backupApi.importBackup(json);
          setImportResult(result.imported);
          setImportPreview(null);
          setImportFile(null);
          fetchPreview();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Import failed';
          setError(msg);
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(importFile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setError(msg);
      setImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalRecords = preview
    ? Object.values(preview).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-sm text-gray-500 mt-1">
          Export and import system data. Weekly backups are sent to the
          configured email.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <Download size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Export Data
              </h2>
              <p className="text-sm text-gray-500">
                Download all system data as a JSON file
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-500">Loading preview...</div>
          ) : preview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(preview).map(([key, count]) => {
                  const Icon = ENTITY_ICONS[key] || Database;
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"
                    >
                      <Icon size={16} className="mx-auto text-gray-400 mb-1" />
                      <div className="text-lg font-bold text-gray-900">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ENTITY_LABELS[key]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <span className="text-sm text-blue-700">
                  <strong>{totalRecords}</strong> total records will be exported
                </span>
                <Button onClick={handleExport} disabled={exporting}>
                  <Download size={16} className="mr-2" />
                  {exporting ? 'Exporting...' : 'Export Backup'}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5">
              <Upload size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Import Data
              </h2>
              <p className="text-sm text-gray-500">
                Restore data from a backup file. This will replace all existing
                data.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-amber-300 transition-colors">
              <FileJson size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-3">
                Select a backup JSON file to import
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file-input"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                Choose File
              </Button>
            </div>

            {importFile && !importPreview && !importResult && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                Reading file...
              </div>
            )}

            {importPreview && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                  <AlertTriangle size={16} />
                  Import Preview — This will DELETE all existing data and
                  replace with:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(importPreview).map(([key, items]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-white border border-amber-100 px-3 py-2 text-center"
                    >
                      <div className="text-base font-bold text-gray-900">
                        {Array.isArray(items) ? items.length : 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ENTITY_LABELS[key]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing...' : 'Confirm Import'}
                  </Button>
                  <Button variant="outline" onClick={resetImport}>
                    <Trash2 size={14} className="mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {importResult && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                  <CheckCircle2 size={16} />
                  Import Complete
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(importResult).map(([key, count]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-white border border-green-100 px-3 py-2 text-center"
                    >
                      <div className="text-base font-bold text-gray-900">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ENTITY_LABELS[key]}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={resetImport}>
                  Import Another
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
