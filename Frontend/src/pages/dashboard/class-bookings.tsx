import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  AlertCircle,
  Clock,
  Unlock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { classBookingApi } from '@/lib/api/class-bookings';
import { classApi } from '@/lib/api/seat-plan';
import type { ClassBooking, ClassData } from '@/lib/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function isExpired(endTime: string): boolean {
  return new Date(endTime) <= new Date();
}

export default function ClassBookingsPage() {
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formClassId, setFormClassId] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formDurationValue, setFormDurationValue] = useState(60);
  const [formDurationUnit, setFormDurationUnit] = useState<'minutes' | 'hours'>('minutes');
  const [formErrors, setFormErrors] = useState<{
    classId?: string | null;
    purpose?: string | null;
    duration?: string | null;
  }>({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await classBookingApi.list();
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await classApi.list();
      setClasses(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchClasses();
  }, [fetchBookings, fetchClasses]);

  const resetForm = () => {
    setFormClassId('');
    setFormPurpose('');
    setFormDurationValue(60);
    setFormDurationUnit('minutes');
    setFormErrors({});
    setFormError('');
  };

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof formErrors = {};
    if (!formClassId) errs.classId = 'Class is required';
    if (!formPurpose.trim()) errs.purpose = 'Purpose is required';
    if (formDurationValue < 1) errs.duration = 'Duration must be at least 1';
    if (Object.values(errs).some(Boolean)) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const durationMinutes =
        formDurationUnit === 'hours' ? formDurationValue * 60 : formDurationValue;
      await classBookingApi.create({
        classId: formClassId,
        purpose: formPurpose.trim(),
        durationMinutes,
      });
      setIsBookOpen(false);
      resetForm();
      fetchBookings();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to book class.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFree = async (booking: ClassBooking) => {
    try {
      await classBookingApi.free(booking.id);
      fetchBookings();
    } catch {
      setError('Failed to free class.');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.purpose.toLowerCase().includes(search.toLowerCase()) ||
      (b.className ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.isActive && !isExpired(b.endTime)) ||
      (statusFilter === 'expired' && (!b.isActive || isExpired(b.endTime)));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Bookings</h2>
          <p className="text-sm text-gray-500">
            Book and manage class reservations
          </p>
        </div>
        <Button onClick={() => setIsBookOpen(true)}>
          <Plus size={16} className="mr-2" />
          Book Class
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No bookings found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((booking) => {
            const active = booking.isActive && !isExpired(booking.endTime);
            return (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`rounded-lg p-2.5 ${active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {active ? (
                          <Clock size={18} className="text-green-600" />
                        ) : (
                          <Unlock size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 truncate">
                            {booking.className ?? 'Unknown Class'}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {active ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {booking.purpose}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDate(booking.startTime)}</span>
                          <span>{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                          <span>({formatDuration(booking.startTime, booking.endTime)})</span>
                        </div>
                      </div>
                    </div>
                    {active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFree(booking)}
                        className="shrink-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                      >
                        <Unlock size={14} className="mr-1" />
                        Free
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* BOOK MODAL */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Book a Class"
        description="Reserve a class for a specific duration"
      >
        <form onSubmit={handleBook} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {formError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Class <span className="text-red-500">*</span>
            </Label>
            <select
              value={formClassId}
              onChange={(e) => {
                setFormClassId(e.target.value);
                if (formErrors.classId) setFormErrors((p) => ({ ...p, classId: null }));
              }}
              className={`flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                formErrors.classId ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.classId && (
              <p className="text-xs text-red-500">{formErrors.classId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Purpose <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Physics lecture, Midterm exam"
              value={formPurpose}
              onChange={(e) => {
                setFormPurpose(e.target.value);
                if (formErrors.purpose) setFormErrors((p) => ({ ...p, purpose: null }));
              }}
              className={formErrors.purpose ? 'border-red-300' : ''}
            />
            {formErrors.purpose && (
              <p className="text-xs text-red-500">{formErrors.purpose}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Duration <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={formDurationValue}
                onChange={(e) => {
                  setFormDurationValue(Number(e.target.value));
                  if (formErrors.duration) setFormErrors((p) => ({ ...p, duration: null }));
                }}
                className={`flex-1 ${formErrors.duration ? 'border-red-300' : ''}`}
              />
              <select
                value={formDurationUnit}
                onChange={(e) => setFormDurationUnit(e.target.value as typeof formDurationUnit)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            {formErrors.duration && (
              <p className="text-xs text-red-500">{formErrors.duration}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsBookOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Booking...' : 'Book Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
