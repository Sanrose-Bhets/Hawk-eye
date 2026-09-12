import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ClipboardList,
  Clock,
  Calendar,
  Building2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { examRoutineApi } from '@/lib/api/exam-routines';
import { facultyApi } from '@/lib/api/faculties';
import { moduleApi } from '@/lib/api/modules';
import type { ExamRoutine, Faculty, Module } from '@/lib/types';

interface FormErrors {
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  facultyId?: string | null;
  moduleId?: string | null;
}

function hasErrors(obj: FormErrors): boolean {
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== '',
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
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

export default function ExamRoutinesPage() {
  const today = new Date();
  const [routines, setRoutines] = useState<ExamRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [formModules, setFormModules] = useState<Module[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<ExamRoutine | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formFacultyId, setFormFacultyId] = useState('');
  const [formModuleId, setFormModuleId] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examRoutineApi.list({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });
      setRoutines(res.data);
    } catch {
      setError('Failed to load exam routines.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFacultiesAndModules = useCallback(async () => {
    try {
      const [facRes, modRes] = await Promise.all([
        facultyApi.list({ limit: 100 }),
        moduleApi.list({ limit: 1000 }),
      ]);
      setFaculties(facRes.data.data);
      setAllModules(modRes.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
    fetchFacultiesAndModules();
  }, [fetchRoutines, fetchFacultiesAndModules]);

  useEffect(() => {
    if (!formFacultyId) {
      setFormModules([]);
      return;
    }
    const faculty = faculties.find((f) => f.id === formFacultyId);
    if (faculty) {
      const filtered = allModules.filter((m) => m.facultyId === formFacultyId);
      setFormModules(filtered);
    }
  }, [formFacultyId, faculties, allModules]);

  const filtered = routines.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const facultyName = faculties.find((f) => f.id === r.facultyId)?.name ?? '';
    const moduleName = allModules.find((m) => m.id === r.moduleId)?.name ?? '';
    return (
      facultyName.toLowerCase().includes(q) ||
      moduleName.toLowerCase().includes(q) ||
      r.duration.toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setFormDate('');
    setFormStartTime('');
    setFormEndTime('');
    setFormFacultyId('');
    setFormModuleId('');
    setFormModules([]);
    setFormErrors({});
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (routine: ExamRoutine) => {
    setSelectedRoutine(routine);
    setFormDate(routine.date.split('T')[0]);
    setFormStartTime(routine.startTime);
    setFormEndTime(routine.endTime);
    setFormFacultyId(routine.facultyId);
    setFormModuleId(routine.moduleId);
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (routine: ExamRoutine) => {
    setSelectedRoutine(routine);
    setIsDeleteOpen(true);
  };

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formDate) errors.date = 'Date is required';
    if (!formStartTime) errors.startTime = 'Start time is required';
    if (!formEndTime) errors.endTime = 'End time is required';
    if (!formFacultyId) errors.facultyId = 'Faculty is required';
    if (!formModuleId) errors.moduleId = 'Module is required';
    setFormErrors(errors);
    return hasErrors(errors);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      await examRoutineApi.create({
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        facultyId: formFacultyId,
        moduleId: formModuleId,
      });
      setIsCreateOpen(false);
      fetchRoutines();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? 'Failed to create exam routine')
          : err instanceof Error
            ? err.message
            : 'Failed to create exam routine';
      setFormError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRoutine) return;
    if (validate()) return;

    setSubmitting(true);
    setFormError('');
    try {
      await examRoutineApi.update(selectedRoutine.id, {
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        facultyId: formFacultyId,
        moduleId: formModuleId,
      });
      setIsEditOpen(false);
      fetchRoutines();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? 'Failed to update exam routine')
          : err instanceof Error
            ? err.message
            : 'Failed to update exam routine';
      setFormError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoutine) return;
    setSubmitting(true);
    try {
      await examRoutineApi.delete(selectedRoutine.id);
      setIsDeleteOpen(false);
      fetchRoutines();
    } catch {
      setError('Failed to delete exam routine.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFacultyName = (id: string) =>
    faculties.find((f) => f.id === id)?.name ?? 'Unknown';
  const getModuleName = (id: string) =>
    allModules.find((m) => m.id === id)?.name ?? 'Unknown';

  const FormFields = () => (
    <>
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {formError}
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs">
          Date <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          value={formDate}
          onChange={(e) => {
            setFormDate(e.target.value);
            if (formErrors.date) setFormErrors((p) => ({ ...p, date: null }));
          }}
          className={formErrors.date ? 'border-red-300' : ''}
        />
        {formErrors.date && (
          <p className="text-xs text-red-500">{formErrors.date}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">
            Start Time <span className="text-red-500">*</span>
          </Label>
          <Input
            type="time"
            value={formStartTime}
            onChange={(e) => {
              setFormStartTime(e.target.value);
              if (formErrors.startTime)
                setFormErrors((p) => ({ ...p, startTime: null }));
            }}
            className={formErrors.startTime ? 'border-red-300' : ''}
          />
          {formErrors.startTime && (
            <p className="text-xs text-red-500">{formErrors.startTime}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            End Time <span className="text-red-500">*</span>
          </Label>
          <Input
            type="time"
            value={formEndTime}
            onChange={(e) => {
              setFormEndTime(e.target.value);
              if (formErrors.endTime)
                setFormErrors((p) => ({ ...p, endTime: null }));
            }}
            className={formErrors.endTime ? 'border-red-300' : ''}
          />
          {formErrors.endTime && (
            <p className="text-xs text-red-500">{formErrors.endTime}</p>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">
          Faculty <span className="text-red-500">*</span>
        </Label>
        <select
          value={formFacultyId}
          onChange={(e) => {
            setFormFacultyId(e.target.value);
            setFormModuleId('');
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
          Module <span className="text-red-500">*</span>
        </Label>
        <select
          value={formModuleId}
          onChange={(e) => {
            setFormModuleId(e.target.value);
            if (formErrors.moduleId)
              setFormErrors((p) => ({ ...p, moduleId: null }));
          }}
          disabled={!formFacultyId}
          className={`flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            formErrors.moduleId ? 'border-red-300' : 'border-gray-200'
          } ${!formFacultyId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {formFacultyId ? 'Select module' : 'Select faculty first'}
          </option>
          {formModules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.code ? ` (${m.code})` : ''}
            </option>
          ))}
        </select>
        {formErrors.moduleId && (
          <p className="text-xs text-red-500">{formErrors.moduleId}</p>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Exam Routines
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage examination schedules
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="cursor-pointer">
          <Plus size={18} className="mr-2" />
          Add Routine
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
          placeholder="Search routines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Routines List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading routines...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">
              {search
                ? 'No routines match your search'
                : 'No exam routines yet'}
            </p>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCreate}
                className="mt-3 cursor-pointer"
              >
                <Plus size={14} className="mr-1" />
                Add Routine
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((routine) => (
            <Card
              key={routine.id}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-orange-600 shrink-0">
                      <ClipboardList size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {getModuleName(routine.moduleId)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Building2 size={12} />
                          {getFacultyName(routine.facultyId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(routine.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(routine.startTime)} –{' '}
                          {formatTime(routine.endTime)}
                        </span>
                        <span className="text-gray-400">
                          ({routine.duration})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(routine)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(routine)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
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

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Exam Routine"
        description="Schedule a new examination"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <FormFields />
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
              {submitting ? 'Creating...' : 'Create Routine'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Exam Routine"
        description="Update examination details"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <FormFields />
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

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Exam Routine"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the exam routine for{' '}
          <span className="font-semibold text-gray-900">
            {selectedRoutine ? getModuleName(selectedRoutine.moduleId) : ''}
          </span>{' '}
          on{' '}
          <span className="font-semibold text-gray-900">
            {selectedRoutine ? formatDate(selectedRoutine.date) : ''}
          </span>
          ?
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
            {submitting ? 'Deleting...' : 'Delete Routine'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
