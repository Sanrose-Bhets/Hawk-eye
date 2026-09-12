import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListFilter,
  X,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  resultApi,
  type CreateResultData,
  type ImportResultItemData,
} from '@/lib/api/results';
import { studentApi } from '@/lib/api/students';
import { moduleApi } from '@/lib/api/modules';
import type { Result, Student, Module } from '@/lib/types';

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  B: 'bg-blue-50 text-blue-700 border-blue-200',
  C: 'bg-amber-50 text-amber-700 border-amber-200',
  D: 'bg-orange-50 text-orange-700 border-orange-200',
  F: 'bg-red-50 text-red-700 border-red-200',
};

interface FormErrors {
  studentId?: string | null;
  items?: string | null;
}

function hasErrors(obj: FormErrors): boolean {
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== '',
  );
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [studentIdsWithResults, setStudentIdsWithResults] = useState<
    Set<string>
  >(new Set());

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [resultItems, setResultItems] = useState<
    { moduleId: string; score: string }[]
  >([{ moduleId: '', score: '' }]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<ImportResultItemData[]>([]);
  const [csvError, setCsvError] = useState('');
  const [importResult, setImportResult] = useState<{
    created: number;
    errors: { studentEmail: string; moduleCode: string; reason: string }[];
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const PAGE_LIMIT = 10;

  const fetchResults = useCallback(
    async (
      search?: string,
      pageNum?: number,
      grade?: string,
      published?: string,
    ) => {
      setLoading(true);
      setError('');
      try {
        const res = await resultApi.list({
          page: pageNum ?? page,
          limit: PAGE_LIMIT,
          search: (search ?? searchQuery) || undefined,
          grade: (grade ?? gradeFilter) || undefined,
          published: (published ?? publishedFilter) || undefined,
        });
        setResults(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch {
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery, gradeFilter, publishedFilter],
  );

  const fetchLookups = useCallback(async () => {
    try {
      const [stuRes, modRes] = await Promise.all([
        studentApi.list({ limit: 100 }),
        moduleApi.list({ limit: 100 }),
      ]);
      setStudents(stuRes.data.data);
      setModules(modRes.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    resultApi
      .list({ limit: 1000 })
      .then((res) => {
        setStudentIdsWithResults(
          new Set(res.data.data.map((r) => r.studentId)),
        );
      })
      .catch(() => {});
  }, []);

  const isModuleSelected = (moduleId: string, currentIndex: number) =>
    resultItems.some(
      (item, i) => i !== currentIndex && item.moduleId === moduleId,
    );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchResults(value, 1, gradeFilter, publishedFilter);
    }, 400);
  };

  const handleGradeFilterChange = (value: string) => {
    setGradeFilter(value);
    setPage(1);
    fetchResults(searchQuery, 1, value, publishedFilter);
  };

  const handlePublishedFilterChange = (value: string) => {
    setPublishedFilter(value);
    setPage(1);
    fetchResults(searchQuery, 1, gradeFilter, value);
  };

  // ── CRUD ──

  const resetForm = () => {
    setSelectedStudentId('');
    setResultItems([{ moduleId: '', score: '' }]);
    setFormErrors({});
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (result: Result) => {
    setSelectedResult(result);
    setSelectedStudentId(result.studentId);
    setResultItems(
      result.items.map((i) => ({
        moduleId: i.moduleId,
        score: String(i.score),
      })),
    );
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDetail = (result: Result) => {
    setSelectedResult(result);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (result: Result) => {
    setSelectedResult(result);
    setIsDeleteOpen(true);
  };

  const handleAddItem = () => {
    setResultItems((p) => [...p, { moduleId: '', score: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setResultItems((p) => p.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'moduleId' | 'score',
    value: string,
  ) => {
    setResultItems((p) =>
      p.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!selectedStudentId) errors.studentId = 'Student is required';
    const validItems = resultItems.filter((i) => i.moduleId && i.score !== '');
    if (validItems.length === 0)
      errors.items = 'At least one module with a score is required';
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      const data: CreateResultData = {
        studentId: selectedStudentId,
        items: validItems.map((i) => ({
          moduleId: i.moduleId,
          score: Number(i.score),
        })),
      };
      await resultApi.create(data);
      setStudentIdsWithResults((prev) => new Set([...prev, selectedStudentId]));
      setIsCreateOpen(false);
      fetchResults(searchQuery, page, gradeFilter, publishedFilter);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create result';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedResult) return;
    const validItems = resultItems.filter((i) => i.moduleId && i.score !== '');
    if (validItems.length === 0) {
      setFormErrors({ items: 'At least one module with a score is required' });
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await resultApi.update(selectedResult.id, {
        items: validItems.map((i) => ({
          moduleId: i.moduleId,
          score: Number(i.score),
        })),
      });
      setIsEditOpen(false);
      fetchResults(searchQuery, page, gradeFilter, publishedFilter);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update result';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResult) return;
    setSubmitting(true);
    try {
      await resultApi.delete(selectedResult.id);
      setIsDeleteOpen(false);
      fetchResults(searchQuery, page, gradeFilter, publishedFilter);
    } catch {
      setError('Failed to delete result.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── CSV Import ──

  const resetImport = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setCsvError('');
    setImportResult(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvUpload = (file: File) => {
    setCsvFile(file);
    setCsvError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        setCsvError('CSV must have a header row and at least one data row');
        return;
      }

      const header = lines[0]
        .toLowerCase()
        .split(',')
        .map((h) => h.trim());
      const emailIdx = header.findIndex((h) => h === 'studentemail');
      const codeIdx = header.findIndex((h) => h === 'modulecode');
      const scoreIdx = header.findIndex((h) => h === 'score');

      if (emailIdx === -1 || codeIdx === -1 || scoreIdx === -1) {
        setCsvError('CSV must have columns: studentEmail, moduleCode, score');
        return;
      }

      const rows: ImportResultItemData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        const email = cols[emailIdx];
        const code = cols[codeIdx];
        const score = Number(cols[scoreIdx]);
        if (!email || !code || isNaN(score)) continue;
        rows.push({ studentEmail: email, moduleCode: code, score });
      }

      if (rows.length === 0) {
        setCsvError('No valid data rows found');
        return;
      }

      setCsvPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (csvPreview.length === 0) return;
    setSubmitting(true);
    setCsvError('');
    try {
      const res = await resultApi.import(csvPreview);
      setImportResult(res.data);
      if (res.data.created > 0) {
        resultApi.list({ limit: 1000 }).then((r) => {
          setStudentIdsWithResults(
            new Set(r.data.data.map((res) => res.studentId)),
          );
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setCsvError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (result: Result) => {
    try {
      await resultApi.publish(result.id, !result.published);
      fetchResults(searchQuery, page, gradeFilter, publishedFilter);
    } catch {
      setError('Failed to update publish status.');
    }
  };

  // ── Render ──

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Results Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, view, and manage student exam results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetImport();
              setIsImportOpen(true);
            }}
            className="cursor-pointer"
          >
            <Upload size={18} className="mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleOpenCreate} className="cursor-pointer">
            <Plus size={18} className="mr-2" />
            Add Result
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Search by student name, email, or module..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
          />
        </div>

        <div className="relative w-full sm:w-auto shrink-0">
          <div className="relative inline-flex w-full sm:w-32 items-center">
            <ListFilter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <select
              value={gradeFilter}
              onChange={(e) => handleGradeFilterChange(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary-ring focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="">All Grades</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-auto shrink-0">
          <div className="relative inline-flex w-full sm:w-40 items-center">
            <select
              value={publishedFilter}
              onChange={(e) => handlePublishedFilterChange(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary-ring focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
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

      {/* Results List */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-16 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                  <BookOpen size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No results found
                </p>
                <p className="text-xs text-gray-500">
                  {searchQuery || gradeFilter || publishedFilter
                    ? 'Try a different search or filter'
                    : 'Add results to get started'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="px-5 py-4 hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {result.studentName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {result.studentEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {result.items.map((item) => (
                            <span
                              key={item.id}
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${GRADE_COLORS[item.grade] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                            >
                              {item.moduleCode ?? item.moduleName}: {item.score}
                              <span className="font-bold">{item.grade}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishToggle(result);
                          }}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            result.published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {result.published ? 'Published' : 'Unpublished'}
                        </button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(result);
                            }}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDelete(result);
                            }}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages} ({total} results)
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                fetchResults(searchQuery, p, gradeFilter, publishedFilter);
              }}
              className="cursor-pointer"
            >
              <ChevronLeft size={15} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                fetchResults(searchQuery, p, gradeFilter, publishedFilter);
              }}
              className="cursor-pointer"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── MODALS ── */}
      {/* ══════════════════════════════════════════════ */}

      {/* Create Result Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Result"
        description="Add exam results for a student across multiple modules"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Student <span className="text-red-500">*</span>
            </Label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                if (formErrors.studentId)
                  setFormErrors((p) => ({ ...p, studentId: null }));
              }}
              className={`flex h-9 w-full rounded-lg border bg-white px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                formErrors.studentId ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  disabled={studentIdsWithResults.has(s.id)}
                >
                  {s.name} ({s.email})
                  {studentIdsWithResults.has(s.id) ? ' — has results' : ''}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="text-xs text-red-500">{formErrors.studentId}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Module Scores <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="cursor-pointer h-7 text-xs"
              >
                <Plus size={12} className="mr-1" />
                Add Module
              </Button>
            </div>
            {formErrors.items && (
              <p className="text-xs text-red-500">{formErrors.items}</p>
            )}
            {resultItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select
                  value={item.moduleId}
                  onChange={(e) =>
                    handleItemChange(idx, 'moduleId', e.target.value)
                  }
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select module</option>
                  {modules.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={
                        m.id !== item.moduleId && isModuleSelected(m.id, idx)
                      }
                    >
                      {m.code ? `${m.code} - ` : ''}
                      {m.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Score"
                  value={item.score}
                  onChange={(e) =>
                    handleItemChange(idx, 'score', e.target.value)
                  }
                  className="w-24 h-9 text-sm"
                />
                {item.score && (
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold h-9 ${GRADE_COLORS[calcGrade(Number(item.score))] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {calcGrade(Number(item.score))}
                  </span>
                )}
                {resultItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer h-9"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Result'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Result Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Result"
        description="Update module scores for this student"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Student</Label>
            <Input
              value={
                students.find((s) => s.id === selectedStudentId)?.name ?? ''
              }
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">
                Module Scores <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="cursor-pointer h-7 text-xs"
              >
                <Plus size={12} className="mr-1" />
                Add Module
              </Button>
            </div>
            {formErrors.items && (
              <p className="text-xs text-red-500">{formErrors.items}</p>
            )}
            {resultItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select
                  value={item.moduleId}
                  onChange={(e) =>
                    handleItemChange(idx, 'moduleId', e.target.value)
                  }
                  className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select module</option>
                  {modules.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={
                        m.id !== item.moduleId && isModuleSelected(m.id, idx)
                      }
                    >
                      {m.code ? `${m.code} - ` : ''}
                      {m.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Score"
                  value={item.score}
                  onChange={(e) =>
                    handleItemChange(idx, 'score', e.target.value)
                  }
                  className="w-24 h-9 text-sm"
                />
                {item.score && (
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold h-9 ${GRADE_COLORS[calcGrade(Number(item.score))] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {calcGrade(Number(item.score))}
                  </span>
                )}
                {resultItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer h-9"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedResult?.studentName ?? 'Result Details'}
        description={selectedResult?.studentEmail ?? undefined}
      >
        {selectedResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedResult.published
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {selectedResult.published ? 'Published' : 'Unpublished'}
              </span>
            </div>

            <div className="space-y-2">
              {selectedResult.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.moduleName}
                    </p>
                    {item.moduleCode && (
                      <p className="text-xs text-gray-500 font-mono">
                        {item.moduleCode}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      {item.score}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${GRADE_COLORS[item.grade] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      {item.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEdit(selectedResult);
                }}
                className="cursor-pointer"
              >
                <Pencil size={14} className="mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenDelete(selectedResult);
                }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Result"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the results for{' '}
          <span className="font-semibold text-gray-900">
            {selectedResult?.studentName}
          </span>
          ? This will permanently remove all module scores.
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
            {submitting ? 'Deleting...' : 'Delete Result'}
          </Button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════ */}
      {/* ── IMPORT MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Results from CSV"
        description="Upload a CSV with columns: studentEmail, moduleCode, score"
      >
        <div className="space-y-4">
          {importResult ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Successfully imported {importResult.created} result(s)
              </div>
              {importResult.errors.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="font-medium mb-1">
                    {importResult.errors.length} row(s) had errors:
                  </p>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i}>
                        {err.studentEmail} / {err.moduleCode}: {err.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetImport();
                    setIsImportOpen(false);
                    fetchResults(
                      searchQuery,
                      page,
                      gradeFilter,
                      publishedFilter,
                    );
                  }}
                  className="cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCsvUpload(file);
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => csvInputRef.current?.click()}
                  className="cursor-pointer w-full h-20 border-dashed"
                >
                  <div className="text-center">
                    <FileSpreadsheet
                      size={24}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm text-gray-600">
                      {csvFile ? csvFile.name : 'Click to upload CSV'}
                    </p>
                  </div>
                </Button>
              </div>

              {csvError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {csvError}
                </div>
              )}

              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Preview ({csvPreview.length} rows):
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Student Email
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Module Code
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Score
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {csvPreview.map((row, i) => (
                          <tr key={i} className="bg-white">
                            <td className="px-3 py-2 text-gray-900">
                              {row.studentEmail}
                            </td>
                            <td className="px-3 py-2 text-gray-900 font-mono">
                              {row.moduleCode}
                            </td>
                            <td className="px-3 py-2 text-gray-900">
                              {row.score}
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${GRADE_COLORS[calcGrade(row.score)] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}
                              >
                                {calcGrade(row.score)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsImportOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  disabled={submitting || csvPreview.length === 0}
                  className="cursor-pointer"
                >
                  {submitting ? 'Importing...' : 'Import Results'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

function calcGrade(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  if (score >= 28) return 'D';
  return 'F';
}
