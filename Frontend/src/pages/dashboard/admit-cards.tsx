import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Trash2,
  X,
  AlertCircle,
  FileText,
  Download,
  Users,
  Building2,
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  Armchair,
  CheckCircle2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { admitCardApi } from '@/lib/api/admit-cards';
import { facultyApi } from '@/lib/api/faculties';
import { classApi } from '@/lib/api/seat-plan';
import type { AdmitCard, Faculty, ClassData } from '@/lib/types';

function normalizeDate(raw: unknown): Date | null {
  if (!raw) return null;
  if (typeof raw === 'object' && raw !== null && 'epochMilliseconds' in raw) {
    const ms = (raw as { epochMilliseconds: number }).epochMilliseconds;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      const [y, m, day] = raw.trim().split('-').map(Number);
      return new Date(y, m - 1, day);
    }
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const d = normalizeDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return time;
  const m = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function AdmitCardsPage() {
  const [cards, setCards] = useState<AdmitCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
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
  const [formClassId, setFormClassId] = useState('');
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
      const [facRes, clsRes] = await Promise.all([
        facultyApi.list({ limit: 100 }),
        classApi.list(),
      ]);
      setFaculties(facRes.data.data);
      setClasses(clsRes.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCards();
    fetchFaculties();
  }, [fetchCards, fetchFaculties]);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (facultyFilter && c.facultyName !== facultyFilter) {
        const fac = faculties.find((f) => f.id === facultyFilter);
        if (fac && c.facultyName !== fac.name) return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (c.studentName?.toLowerCase().includes(q) ?? false) ||
        (c.studentEmail?.toLowerCase().includes(q) ?? false) ||
        (c.moduleName?.toLowerCase().includes(q) ?? false) ||
        (c.moduleCode?.toLowerCase().includes(q) ?? false) ||
        (c.facultyName?.toLowerCase().includes(q) ?? false) ||
        (c.seatNumber?.toLowerCase().includes(q) ?? false) ||
        (c.roomName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [cards, search, facultyFilter, faculties]);

  const stats = useMemo(() => {
    const totalCards = cards.length;
    const uniqueStudents = new Set(
      cards.map((c) => c.studentEmail || c.studentId),
    ).size;
    const uniqueModules = new Set(
      cards.map((c) => c.moduleName || c.moduleCode || c.examRoutineId),
    ).size;
    return { totalCards, uniqueStudents, uniqueModules };
  }, [cards]);

  const resetForm = () => {
    setFormFacultyId('');
    setFormSemester(1);
    setFormClassId('');
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
    if (!formFacultyId) errors.facultyId = 'Please select a faculty';
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
        classId: formClassId || undefined,
      });
      setGenerateResult(res.data);
      fetchCards();
    } catch (err: unknown) {
      let msg = 'Failed to generate admit cards';
      if (err instanceof Error && 'response' in err) {
        const axiosErr = err as {
          response?: { data?: { message?: string | string[] } };
        };
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
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    window.open(`${baseUrl}/api/v1/admit-cards/${card.id}/pdf`, '_blank');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
            Admit Cards
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate, manage, and distribute student examination admit cards
          </p>
        </div>
        <Button
          onClick={handleOpenGenerate}
          className="shrink-0 gap-2 shadow-sm cursor-pointer rounded-xl"
        >
          <Sparkles size={16} />
          Generate Admit Cards
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-gray-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary border border-primary/10">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Admit Cards
              </p>
              <h3 className="text-xl font-bold text-gray-900 font-title mt-0.5">
                {stats.totalCards}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Enrolled Students
              </p>
              <h3 className="text-xl font-bold text-gray-900 font-title mt-0.5">
                {stats.uniqueStudents}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Exam Modules Covered
              </p>
              <h3 className="text-xl font-bold text-gray-900 font-title mt-0.5">
                {stats.uniqueModules}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-400 hover:text-red-700 cursor-pointer p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by student name, email, module code, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-200 shadow-2xs rounded-xl text-sm"
          />
        </div>

        {/* Quick Faculty Filter */}
        <div className="relative sm:w-56 shrink-0">
          <Building2
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="w-full h-11 pl-9 pr-8 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 shadow-2xs focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
          >
            <option value="">All Faculties</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Cards List Grid */}
      {loading ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">
              Loading admit cards...
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4 text-gray-400">
              <FileText size={32} />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              {search || facultyFilter
                ? 'No matching admit cards found'
                : 'No admit cards generated yet'}
            </p>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              {search || facultyFilter
                ? 'Try resetting your search query or faculty filter'
                : 'Generate your first batch of examination admit cards for students'}
            </p>
            {!search && !facultyFilter && (
              <Button
                onClick={handleOpenGenerate}
                className="gap-2 cursor-pointer rounded-xl"
              >
                <Sparkles size={16} />
                Generate Admit Cards
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3.5">
          {filtered.map((card) => (
            <Card
              key={card.id}
              className="group rounded-2xl border border-gray-200/90 bg-white shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-150 overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary border border-primary/10 shadow-2xs group-hover:scale-105 transition-transform">
                      <FileText size={22} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Student row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-900 font-title truncate">
                          {card.studentName ?? 'Unknown Student'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-medium truncate">
                          {card.studentEmail}
                        </span>
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                          <GraduationCap size={13} className="text-primary" />
                          {card.moduleName}
                          {card.moduleCode ? ` (${card.moduleCode})` : ''}
                        </span>

                        <span className="hidden sm:inline text-gray-300">
                          •
                        </span>

                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Building2 size={13} className="text-gray-400" />
                          {card.facultyName}
                        </span>

                        {card.examDate && (
                          <>
                            <span className="hidden sm:inline text-gray-300">
                              •
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <Calendar size={13} className="text-gray-400" />
                              {formatDate(card.examDate)}
                            </span>
                          </>
                        )}

                        {card.startTime && card.endTime && (
                          <>
                            <span className="hidden sm:inline text-gray-300">
                              •
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <Clock size={13} className="text-gray-400" />
                              {formatTime(card.startTime)} –{' '}
                              {formatTime(card.endTime)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Badges row for seat and room */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {card.roomName && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            <Layers size={11} />
                            {card.roomName}
                          </span>
                        )}
                        {card.seatNumber && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <Armchair size={11} />
                            Desk {card.seatNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(card)}
                      className="gap-1.5 text-xs font-semibold text-gray-700 hover:text-primary hover:border-primary/40 rounded-xl cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDelete(card)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                      title="Delete Admit Card"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* GENERATE ADMIT CARDS MODAL */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Admit Cards"
        description="Bulk generate examination admit cards with desk allocations for enrolled students"
        className="max-w-xl"
      >
        {generateResult ? (
          <div className="space-y-5 pt-1">
            {/* Success Hero Badge */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/90 to-emerald-50/40 p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mx-auto mb-3 shadow-2xs">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900 font-title">
                Generation Completed Successfully
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                Admit cards have been prepared with exam schedules and student
                identifiers.
              </p>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-white border border-emerald-100 p-3 shadow-2xs">
                  <span className="text-xs font-medium text-gray-500">
                    Generated Cards
                  </span>
                  <p className="text-2xl font-bold text-emerald-600 font-title mt-0.5">
                    {generateResult.generated}
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-2xs">
                  <span className="text-xs font-medium text-gray-500">
                    Skipped (Existing)
                  </span>
                  <p className="text-2xl font-bold text-gray-700 font-title mt-0.5">
                    {generateResult.skipped}
                  </p>
                </div>
              </div>

              {generateResult.errors.length > 0 && (
                <div className="mt-4 text-left rounded-xl bg-red-50 border border-red-200 p-3">
                  <p className="text-xs font-bold text-red-800 mb-1">
                    Encountered Issues ({generateResult.errors.length}):
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                    {generateResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={() => setIsGenerateOpen(false)}
                className="w-full sm:w-auto rounded-xl shadow-sm cursor-pointer"
              >
                Done &amp; View Cards
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4 pt-1">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Faculty Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Building2 size={13} className="text-primary" />
                Target Faculty <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  value={formFacultyId}
                  onChange={(e) => {
                    setFormFacultyId(e.target.value);
                    if (formErrors.facultyId)
                      setFormErrors((p) => ({ ...p, facultyId: null }));
                  }}
                  className={`flex w-full h-11 rounded-xl border bg-white px-3.5 pr-9 text-sm text-gray-800 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer ${
                    formErrors.facultyId
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                  }`}
                >
                  <option value="">Select target faculty...</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {formErrors.facultyId && (
                <p className="text-xs text-red-500 pl-1">
                  {formErrors.facultyId}
                </p>
              )}
            </div>

            {/* Semester Selection - Interactive Segmented Buttons */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-primary" />
                  Semester <span className="text-red-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-gray-400">
                  Select term 1 to 6
                </span>
              </Label>
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((s) => {
                  const isSelected = formSemester === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setFormSemester(s);
                        if (formErrors.semester)
                          setFormErrors((p) => ({ ...p, semester: null }));
                      }}
                      className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs scale-102 ring-2 ring-primary/20'
                          : 'bg-gray-50 border border-gray-200/80 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <span>Sem</span>
                      <span className="text-xs leading-none">{s}</span>
                    </button>
                  );
                })}
              </div>
              {formErrors.semester && (
                <p className="text-xs text-red-500 pl-1">
                  {formErrors.semester}
                </p>
              )}
            </div>

            {/* Class Layout Selection (Optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Armchair size={13} className="text-primary" />
                  Class Seating Plan
                </span>
                <span className="text-[11px] font-normal text-gray-400">
                  Optional
                </span>
              </Label>
              <div className="relative">
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="flex w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 pr-9 text-sm text-gray-800 shadow-2xs hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
                >
                  <option value="">
                    No class (Automatic sequential seats)
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.assignments.length} assigned seats)
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 pl-1">
                Select a class to map exact architectural desk labels, or leave
                as default to auto-assign sequential numbers.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateOpen(false)}
                className="cursor-pointer rounded-xl px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 cursor-pointer rounded-xl px-5 shadow-sm"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Cards</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Admit Card"
        description="This action cannot be undone"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to remove the examination admit card for{' '}
            <strong className="font-semibold text-gray-900">
              {selectedCard?.studentName}
            </strong>{' '}
            for module{' '}
            <strong className="font-semibold text-gray-900">
              {selectedCard?.moduleName}
            </strong>
            ?
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="cursor-pointer rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={submitting}
              className="cursor-pointer rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {submitting ? 'Deleting...' : 'Delete Admit Card'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
