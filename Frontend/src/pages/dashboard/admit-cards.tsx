import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Trash2,
  X,
  AlertCircle,
  FileText,
  Download,
  Users,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { admitCardApi } from '@/lib/api/admit-cards';
import { facultyApi } from '@/lib/api/faculties';
import type { AdmitCard, Faculty } from '@/lib/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function AdmitCardsPage() {
  const [cards, setCards] = useState<AdmitCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AdmitCard | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generateResult, setGenerateResult] = useState<{
    generated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const [formFacultyId, setFormFacultyId] = useState('');
  const [formSemester, setFormSemester] = useState(1);
  const [formErrors, setFormErrors] = useState<{
    facultyId?: string | null;
    semester?: string | null;
  }>({});
  const [formError, setFormError] = useState('');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admitCardApi.list();
      setCards(res.data);
    } catch {
      setError('Failed to load admit cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFaculties = useCallback(async () => {
    try {
      const res = await facultyApi.list({ limit: 100 });
      setFaculties(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCards();
    fetchFaculties();
  }, [fetchCards, fetchFaculties]);

  const filtered = cards.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.studentName?.toLowerCase().includes(q) ?? false) ||
      (c.studentEmail?.toLowerCase().includes(q) ?? false) ||
      (c.moduleName?.toLowerCase().includes(q) ?? false) ||
      (c.facultyName?.toLowerCase().includes(q) ?? false)
    );
  });

  const resetForm = () => {
    setFormFacultyId('');
    setFormSemester(1);
    setFormErrors({});
    setFormError('');
    setGenerateResult(null);
  };

  const handleOpenGenerate = () => {
    resetForm();
    setIsGenerateOpen(true);
  };

  const handleOpenDelete = (card: AdmitCard) => {
    setSelectedCard(card);
    setIsDeleteOpen(true);
  };

  const validate = (): boolean => {
    const errors: { facultyId?: string | null; semester?: string | null } = {};
    if (!formFacultyId) errors.facultyId = 'Faculty is required';
    if (!formSemester || formSemester < 1 || formSemester > 6)
      errors.semester = 'Semester must be between 1 and 6';
    setFormErrors(errors);
    return Object.values(errors).some(
      (v) => v !== null && v !== undefined && v !== '',
    );
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) return;

    setSubmitting(true);
    setFormError('');
    setGenerateResult(null);
    try {
      const res = await admitCardApi.generateBulk({
        facultyId: formFacultyId,
        semester: formSemester,
      });
      setGenerateResult(res.data);
      fetchCards();
    } catch (err: unknown) {
      let msg = 'Failed to generate admit cards';
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
        const serverMsg = axiosErr.response?.data?.message;
        msg = Array.isArray(serverMsg) ? serverMsg[0] : (serverMsg ?? msg);
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;
    setSubmitting(true);
    try {
      await admitCardApi.delete(selectedCard.id);
      setIsDeleteOpen(false);
      fetchCards();
    } catch {
      setError('Failed to delete admit card.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = (card: AdmitCard) => {
    const baseUrl =
      import.meta.env.VITE_API_URL || window.location.origin;
    window.open(`${baseUrl}/api/v1/admit-cards/${card.id}/pdf`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admit Cards
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and manage examination admit cards
          </p>
        </div>
        <Button onClick={handleOpenGenerate} className="cursor-pointer">
          <Plus size={18} className="mr-2" />
          Generate Admit Cards
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search by student, module, or faculty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading admit cards...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">
              {search
                ? 'No admit cards match your search'
                : 'No admit cards generated yet'}
            </p>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenGenerate}
                className="mt-3 cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Generate Admit Cards
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((card) => (
            <Card
              key={card.id}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {card.studentName ?? 'Unknown Student'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {card.studentEmail}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} />
                          {card.moduleName}
                          {card.moduleCode ? ` (${card.moduleCode})` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {card.facultyName}
                        </span>
                        {card.examDate && (
                          <span>
                            {formatDate(card.examDate)}
                          </span>
                        )}
                        {card.startTime && card.endTime && (
                          <span>
                            {formatTime(card.startTime)} –{' '}
                            {formatTime(card.endTime)}
                          </span>
                        )}
                        {card.seatNumber && (
                          <span className="text-blue-600 font-medium">
                            Seat {card.seatNumber}
                          </span>
                        )}
                        {card.roomName && (
                          <span className="text-blue-600 font-medium">
                            {card.roomName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleDownloadPdf(card)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(card)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* GENERATE MODAL */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Admit Cards"
        description="Bulk generate admit cards for all students in a faculty and semester"
      >
        {generateResult ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-800">
                <Users size={16} />
                Generation Complete
              </div>
              <div className="mt-2 text-sm text-green-700 space-y-1">
                <p>
                  <span className="font-semibold">{generateResult.generated}</span>{' '}
                  admit cards generated
                </p>
                <p>
                  <span className="font-semibold">{generateResult.skipped}</span>{' '}
                  skipped (already exist)
                </p>
                {generateResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-red-700">Errors:</p>
                    <ul className="list-disc list-inside text-xs text-red-600">
                      {generateResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsGenerateOpen(false)}
                className="cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            {formError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Faculty <span className="text-red-500">*</span>
              </Label>
              <select
                value={formFacultyId}
                onChange={(e) => {
                  setFormFacultyId(e.target.value);
                  if (formErrors.facultyId)
                    setFormErrors((p) => ({ ...p, facultyId: null }));
                }}
                className={`flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  formErrors.facultyId ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Select faculty</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {formErrors.facultyId && (
                <p className="text-xs text-red-500">{formErrors.facultyId}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                Semester <span className="text-red-500">*</span>
              </Label>
              <select
                value={formSemester}
                onChange={(e) => {
                  setFormSemester(Number(e.target.value));
                  if (formErrors.semester)
                    setFormErrors((p) => ({ ...p, semester: null }));
                }}
                className={`flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  formErrors.semester ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              {formErrors.semester && (
                <p className="text-xs text-red-500">{formErrors.semester}</p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              This will generate admit cards for all enrolled students in the
              selected faculty and semester for all scheduled exams.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="cursor-pointer"
              >
                {submitting ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Admit Card"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the admit card for{' '}
          <span className="font-semibold text-gray-900">
            {selectedCard?.studentName}
          </span>{' '}
          ({selectedCard?.moduleName})?
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={submitting}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
