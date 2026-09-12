import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CalendarDays,
  StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { calendarApi } from '@/lib/api/calendar';
import { examRoutineApi } from '@/lib/api/exam-routines';
import type { CalendarNote, ExamRoutine } from '@/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface FormErrors {
  title?: string | null;
  date?: string | null;
}

function hasErrors(obj: FormErrors): boolean {
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== '',
  );
}

export default function CalendarPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [routines, setRoutines] = useState<ExamRoutine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CalendarNote | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteDate, setNoteDate] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [notesRes, routinesRes] = await Promise.all([
        calendarApi.list({
          month: currentMonth + 1,
          year: currentYear,
        }),
        examRoutineApi.list({
          month: currentMonth + 1,
          year: currentYear,
        }),
      ]);
      setNotes(notesRes.data);
      setRoutines(routinesRes.data);
    } catch {
      setError('Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const notesByDate = new Map<string, CalendarNote[]>();
  for (const note of notes) {
    const key = note.date.split('T')[0];
    if (!notesByDate.has(key)) notesByDate.set(key, []);
    notesByDate.get(key)!.push(note);
  }

  const routinesByDate = new Map<string, ExamRoutine[]>();
  for (const routine of routines) {
    const key = routine.date.split('T')[0];
    if (!routinesByDate.has(key)) routinesByDate.set(key, []);
    routinesByDate.get(key)!.push(routine);
  }

  const selectedNotes = selectedDate
    ? (notesByDate.get(selectedDate) ?? [])
    : [];
  const selectedRoutines = selectedDate
    ? (routinesByDate.get(selectedDate) ?? [])
    : [];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteDate('');
    setFormErrors({});
    setFormError('');
  };

  const handleOpenCreate = (date?: string) => {
    resetForm();
    setNoteDate(
      date ??
        selectedDate ??
        formatDateKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (note: CalendarNote) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content ?? '');
    setNoteDate(note.date.split('T')[0]);
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };

  const handleOpenDelete = (note: CalendarNote) => {
    setSelectedNote(note);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!noteTitle.trim()) errors.title = 'Title is required';
    if (!noteDate) errors.date = 'Date is required';
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      await calendarApi.create({
        date: noteDate,
        title: noteTitle.trim(),
        content: noteContent.trim() || undefined,
      });
      setIsCreateOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create note';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedNote) return;
    const errors: FormErrors = {};
    if (!noteTitle.trim()) errors.title = 'Title is required';
    if (!noteDate) errors.date = 'Date is required';
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      await calendarApi.update(selectedNote.id, {
        date: noteDate,
        title: noteTitle.trim(),
        content: noteContent.trim() || undefined,
      });
      setIsEditOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update note';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    setSubmitting(true);
    try {
      await calendarApi.delete(selectedNote.id);
      setIsDeleteOpen(false);
      if (selectedDate) {
        setSelectedDate(null);
      }
      fetchData();
    } catch {
      setError('Failed to delete note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your schedule and notes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Notes
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Exams
            </span>
          </div>
          <Button onClick={() => handleOpenCreate()} className="cursor-pointer">
            <Plus size={18} className="mr-2" />
            Add Note
          </Button>
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <Card className="flex-1">
          <CardContent className="p-5">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="cursor-pointer"
              >
                <ChevronLeft size={16} />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="cursor-pointer"
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="py-16 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-20" />;
                  }

                  const dateKey = formatDateKey(currentYear, currentMonth, day);
                  const dayNotes = notesByDate.get(dateKey) ?? [];
                  const dayRoutines = routinesByDate.get(dateKey) ?? [];
                  const isSelected = selectedDate === dateKey;
                  const todayClass = isToday(day);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`relative h-20 rounded-lg border p-1.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary-light ring-1 ring-primary'
                          : todayClass
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {dayNotes.length > 0 && dayRoutines.length > 0 && (
                        <>
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                          <span className="absolute top-1.5 right-4 h-2 w-2 rounded-full bg-orange-500" />
                        </>
                      )}
                      {dayNotes.length > 0 && dayRoutines.length === 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                      {dayRoutines.length > 0 && dayNotes.length === 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
                      )}
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          todayClass ? 'bg-primary text-white' : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Side Panel */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="sticky top-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {selectedDate
                    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        },
                      )
                    : 'Select a day'}
                </h3>
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreate(selectedDate)}
                    className="cursor-pointer h-7 text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    Add
                  </Button>
                )}
              </div>

              {!selectedDate ? (
                <div className="py-10 text-center">
                  <CalendarDays
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-xs text-gray-500">
                    Click a day to view notes &amp; routines
                  </p>
                </div>
              ) : selectedNotes.length === 0 &&
                selectedRoutines.length === 0 ? (
                <div className="py-10 text-center">
                  <StickyNote
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mb-2">
                    Nothing scheduled for this day
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreate(selectedDate)}
                    className="cursor-pointer text-xs"
                  >
                    <Plus size={12} className="mr-1" />
                    Add Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedRoutines.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider mb-1.5">
                        Exam Routines
                      </p>
                      <div className="space-y-1.5">
                        {selectedRoutines.map((routine) => {
                          const modName = routine.moduleName || '';
                          const facName = routine.facultyName || '';
                          return (
                            <div
                              key={routine.id}
                              className="rounded-lg border border-orange-200 bg-orange-50 p-2.5"
                            >
                              <p className="text-xs font-medium text-orange-900">
                                {routine.startTime} – {routine.endTime} (
                                {routine.duration})
                              </p>
                              <p className="text-[10px] text-orange-600 mt-0.5">
                                {modName}
                                {facName ? ` • ${facName}` : ''}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedNotes.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Notes
                      </p>
                      <div className="space-y-1.5">
                        {selectedNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {note.title}
                                </p>
                                {note.content && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {note.content}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEdit(note)}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() => handleOpenDelete(note)}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ── CREATE MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Calendar Note"
        description="Create a note for this date"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
              value={noteDate}
              onChange={(e) => {
                setNoteDate(e.target.value);
                if (formErrors.date)
                  setFormErrors((p) => ({ ...p, date: null }));
              }}
              className={formErrors.date ? 'border-red-300' : ''}
            />
            {formErrors.date && (
              <p className="text-xs text-red-500">{formErrors.date}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => {
                setNoteTitle(e.target.value);
                if (formErrors.title)
                  setFormErrors((p) => ({ ...p, title: null }));
              }}
              className={formErrors.title ? 'border-red-300' : ''}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500">{formErrors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Content</Label>
            <textarea
              placeholder="Add details (optional)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
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
              {submitting ? 'Creating...' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════════ */}
      {/* ── EDIT MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Calendar Note"
        description="Update this note"
      >
        <form onSubmit={handleEdit} className="space-y-4">
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
              value={noteDate}
              onChange={(e) => {
                setNoteDate(e.target.value);
                if (formErrors.date)
                  setFormErrors((p) => ({ ...p, date: null }));
              }}
              className={formErrors.date ? 'border-red-300' : ''}
            />
            {formErrors.date && (
              <p className="text-xs text-red-500">{formErrors.date}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => {
                setNoteTitle(e.target.value);
                if (formErrors.title)
                  setFormErrors((p) => ({ ...p, title: null }));
              }}
              className={formErrors.title ? 'border-red-300' : ''}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500">{formErrors.title}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Content</Label>
            <textarea
              placeholder="Add details (optional)"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
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

      {/* ══════════════════════════════════════════════ */}
      {/* ── DELETE MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Note"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {selectedNote?.title}
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
            {submitting ? 'Deleting...' : 'Delete Note'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
