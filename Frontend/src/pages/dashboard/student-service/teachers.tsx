import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  teacherApi,
  type CreateTeacherData,
  type UpdateTeacherData,
} from '@/lib/api/teachers';
import { facultyApi } from '@/lib/api/faculties';
import { moduleApi } from '@/lib/api/modules';
import type { Teacher, Faculty, Module } from '@/lib/types';

interface FormErrors {
  name?: string | null;
  email?: string | null;
}

function validateName(v: string): string | null {
  if (!v.trim()) return 'Name is required';
  if (v.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}
function validateEmail(v: string): string | null {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email';
  return null;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [modulesList, setModulesList] = useState<Module[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const PAGE_LIMIT = 12;

  const fetchTeachers = useCallback(
    async (searchVal?: string, pageNum?: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await teacherApi.list({
          page: pageNum ?? page,
          limit: PAGE_LIMIT,
          search: (searchVal ?? search) || undefined,
        });
        setTeachers(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch {
        setError('Failed to load teachers.');
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  const fetchFacultiesAndModules = useCallback(async () => {
    try {
      const [facRes, modRes] = await Promise.all([
        facultyApi.list({ limit: 100 }),
        moduleApi.list({ limit: 100 }),
      ]);
      setFaculties(facRes.data.data);
      setModulesList(modRes.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchFacultiesAndModules();
  }, [fetchFacultiesAndModules]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchTeachers(value, 1);
    }, 400);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSelectedFacultyIds([]);
    setSelectedModuleIds([]);
    setFormErrors({});
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };
  const handleOpenEdit = (t: Teacher) => {
    setSelected(t);
    setName(t.name);
    setEmail(t.email);
    setSelectedFacultyIds(t.facultyIds ?? []);
    setSelectedModuleIds(t.moduleIds ?? []);
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };
  const handleOpenDelete = (t: Teacher) => {
    setSelected(t);
    setIsDeleteOpen(true);
  };

  const toggleFaculty = (id: string) => {
    setSelectedFacultyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleModule = (id: string) => {
    setSelectedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    errors.name = validateName(name);
    errors.email = validateEmail(email);
    setFormErrors(errors);
    if (Object.values(errors).some((v) => v)) return;
    setSubmitting(true);
    setFormError('');
    try {
      const data: CreateTeacherData = {
        name: name.trim(),
        email: email.trim(),
        facultyIds: selectedFacultyIds.length ? selectedFacultyIds : undefined,
        moduleIds: selectedModuleIds.length ? selectedModuleIds : undefined,
      };
      await teacherApi.create(data);
      setIsCreateOpen(false);
      fetchTeachers(search, 1);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create teacher';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const errors: FormErrors = {};
    errors.name = validateName(name);
    errors.email = validateEmail(email);
    setFormErrors(errors);
    if (Object.values(errors).some((v) => v)) return;
    setSubmitting(true);
    setFormError('');
    try {
      const data: UpdateTeacherData = {
        name: name.trim(),
        email: email.trim(),
        facultyIds: selectedFacultyIds,
        moduleIds: selectedModuleIds,
      };
      await teacherApi.update(selected.id, data);
      setIsEditOpen(false);
      fetchTeachers(search, page);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update teacher';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await teacherApi.delete(selected.id);
      setIsDeleteOpen(false);
      fetchTeachers(search, page);
    } catch {
      setError('Failed to delete teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFacultyNames = (ids: string[]) =>
    ids
      .map((id) => faculties.find((f) => f.id === id)?.name ?? id)
      .join(', ') || '—';
  const getModuleNames = (ids: string[]) =>
    ids
      .map((id) => modulesList.find((m) => m.id === id)?.name ?? id)
      .join(', ') || '—';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage teachers, assign faculties and modules, and trigger exam
            routine notifications
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="cursor-pointer shrink-0">
          <Plus size={18} className="mr-2" />
          Add Teacher
        </Button>
      </div>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
        />
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

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-16 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading teachers...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                  <GraduationCap size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No teachers found
                </p>
                <p className="text-xs text-gray-500">
                  {search
                    ? 'Try a different search'
                    : 'Add your first teacher to get started'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {teachers.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.email}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(t.facultyIds ?? []).length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            {getFacultyNames(t.facultyIds ?? [])}
                          </span>
                        )}
                        {(t.moduleIds ?? []).length > 0 && (
                          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                            {getModuleNames(t.moduleIds ?? [])}
                          </span>
                        )}
                        {(t.facultyIds ?? []).length === 0 &&
                          (t.moduleIds ?? []).length === 0 && (
                            <span className="text-[11px] text-gray-400">
                              No faculty/module assigned
                            </span>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(t)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages} ({total} teachers)
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                fetchTeachers(search, p);
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
                fetchTeachers(search, p);
              }}
              className="cursor-pointer"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Teacher"
        description="Create a new teacher and assign faculties/modules"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Dr. Jane Smith"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formErrors.name)
                  setFormErrors((p) => ({ ...p, name: null }));
              }}
              className={formErrors.name ? 'border-red-300' : ''}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="teacher@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email)
                  setFormErrors((p) => ({ ...p, email: null }));
              }}
              className={formErrors.email ? 'border-red-300' : ''}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Faculties</Label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
              {faculties.length === 0 ? (
                <p className="text-xs text-gray-400 p-1">
                  No faculties available
                </p>
              ) : (
                faculties.map((f) => (
                  <label
                    key={f.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFacultyIds.includes(f.id)}
                      onChange={() => toggleFaculty(f.id)}
                      className="rounded"
                    />
                    {f.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Modules</Label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
              {modulesList.length === 0 ? (
                <p className="text-xs text-gray-400 p-1">
                  No modules available
                </p>
              ) : (
                modulesList.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModuleIds.includes(m.id)}
                      onChange={() => toggleModule(m.id)}
                      className="rounded"
                    />
                    {m.name} {m.code ? `(${m.code})` : ''}
                  </label>
                ))
              )}
            </div>
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
              {submitting ? 'Creating...' : 'Create Teacher'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Teacher"
        description="Update teacher details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (formErrors.name)
                  setFormErrors((p) => ({ ...p, name: null }));
              }}
              className={formErrors.name ? 'border-red-300' : ''}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email)
                  setFormErrors((p) => ({ ...p, email: null }));
              }}
              className={formErrors.email ? 'border-red-300' : ''}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Faculties</Label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
              {faculties.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedFacultyIds.includes(f.id)}
                    onChange={() => toggleFaculty(f.id)}
                    className="rounded"
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Modules</Label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
              {modulesList.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 px-1 py-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedModuleIds.includes(m.id)}
                    onChange={() => toggleModule(m.id)}
                    className="rounded"
                  />
                  {m.name} {m.code ? `(${m.code})` : ''}
                </label>
              ))}
            </div>
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

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Teacher"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{selected?.name}</span>?
          This will permanently remove the teacher.
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
            {submitting ? 'Deleting...' : 'Delete Teacher'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
