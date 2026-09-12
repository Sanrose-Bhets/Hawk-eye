import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Mail,
  Send,
  CheckCheck,
  Clock,
  Plus,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { mailApi } from '@/lib/api/mail';
import { studentApi } from '@/lib/api/students';
import type { EmailLog, MailStats, Student } from '@/lib/types';

interface FormErrors {
  studentId?: string | null;
  subject?: string | null;
  body?: string | null;
  studentIds?: string | null;
}

function hasErrors(obj: FormErrors): boolean {
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== '',
  );
}

export default function MailManagementPage() {
  const [stats, setStats] = useState<MailStats>({
    totalSent: 0,
    totalQueued: 0,
    totalFailed: 0,
  });
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const isBodyEmpty = (html: string) =>
    !html || html.replace(/<[^>]*>/g, '').trim().length === 0;

  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_LIMIT = 10;

  const fetchStats = useCallback(async () => {
    try {
      const res = await mailApi.getStats();
      setStats(res.data);
    } catch {
      // silent
    }
  }, []);

  const fetchLogs = useCallback(
    async (pageNum?: number, status?: string) => {
      setLoading(true);
      setError('');
      try {
        const res = await mailApi.listLogs({
          page: pageNum ?? page,
          limit: PAGE_LIMIT,
          status: (status ?? statusFilter) || undefined,
        });
        setLogs(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch {
        setError('Failed to load email logs.');
      } finally {
        setLoading(false);
      }
    },
    [page, statusFilter],
  );

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentApi.list({ limit: 100 });
      setStudents(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    fetchLogs(1, value);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, 400);
  };

  const resetForm = () => {
    setSelectedStudentId('');
    setSelectedStudentIds([]);
    setSubject('');
    setBody('');
    setFormErrors({});
    setFormError('');
    setSuccess('');
  };

  const handleOpenCompose = () => {
    resetForm();
    setIsComposeOpen(true);
  };

  const handleOpenBulk = () => {
    resetForm();
    setIsBulkOpen(true);
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!selectedStudentId) errors.studentId = 'Student is required';
    if (!subject.trim()) errors.subject = 'Subject is required';
    if (isBodyEmpty(body)) errors.body = 'Body is required';
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      await mailApi.send({
        studentId: selectedStudentId,
        subject: subject.trim(),
        body,
      });
      setSuccess('Email queued for delivery!');
      fetchStats();
      fetchLogs();
      setTimeout(() => setIsComposeOpen(false), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send email';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBulk = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (selectedStudentIds.length === 0)
      errors.studentIds = 'Select at least one student';
    if (!subject.trim()) errors.subject = 'Subject is required';
    if (isBodyEmpty(body)) errors.body = 'Body is required';
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      const res = await mailApi.sendBulk({
        studentIds: selectedStudentIds,
        subject: subject.trim(),
        body,
      });
      setSuccess(`${res.data.queued} email(s) queued for delivery!`);
      if (res.data.errors.length > 0) {
        setFormError(
          `${res.data.errors.length} failed: ${res.data.errors.map((e) => e.reason).join(', ')}`,
        );
      }
      fetchStats();
      fetchLogs();
      setTimeout(() => setIsBulkOpen(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send emails';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.to.toLowerCase().includes(q) || log.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Mail Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Send emails to student parents and track delivery status
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleOpenBulk}
            className="cursor-pointer"
          >
            <Users size={18} className="mr-2" />
            Bulk Send
          </Button>
          <Button onClick={handleOpenCompose} className="cursor-pointer">
            <Plus size={18} className="mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Sent Emails
              </span>
              <Send size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalSent}
            </p>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Queued</span>
              <Clock size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {stats.totalQueued}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Failed</span>
              <AlertCircle size={16} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats.totalFailed}
            </p>
            <p className="text-xs text-gray-500 mt-1">Delivery errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Search by recipient or subject..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="h-10 appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm font-medium text-gray-700 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="sent">Sent</option>
          <option value="queued">Queued</option>
          <option value="failed">Failed</option>
        </select>
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

      {/* Email Logs */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-16 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading emails...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                  <Mail size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No emails found
                </p>
                <p className="text-xs text-gray-500">
                  {searchQuery || statusFilter
                    ? 'Try a different search or filter'
                    : 'Send your first email to get started'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary mt-0.5">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {log.subject}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            To: {log.to}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${
                          log.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'queued'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.status === 'sent' && <CheckCheck size={12} />}
                        {log.status === 'queued' && <Clock size={12} />}
                        {log.status === 'failed' && <AlertCircle size={12} />}
                        {log.status.charAt(0).toUpperCase() +
                          log.status.slice(1)}
                      </span>
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
            Page {page} of {totalPages} ({total} emails)
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                fetchLogs(p, statusFilter);
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
                fetchLogs(p, statusFilter);
              }}
              className="cursor-pointer"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── COMPOSE MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose Email"
        description="Send an email to a student's parent"
      >
        <form onSubmit={handleSend} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-600 flex items-center gap-2">
              <CheckCheck size={14} />
              {success}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Recipient (Student Parent) <span className="text-red-500">*</span>
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
                <option key={s.id} value={s.id}>
                  {s.name} — {s.parentEmail}
                </option>
              ))}
            </select>
            {formErrors.studentId && (
              <p className="text-xs text-red-500">{formErrors.studentId}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Email subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (formErrors.subject)
                  setFormErrors((p) => ({ ...p, subject: null }));
              }}
              className={formErrors.subject ? 'border-red-300' : ''}
            />
            {formErrors.subject && (
              <p className="text-xs text-red-500">{formErrors.subject}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Body <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={body}
              onChange={(html) => {
                setBody(html);
                if (formErrors.body)
                  setFormErrors((p) => ({ ...p, body: null }));
              }}
              error={!!formErrors.body}
              placeholder="Write your email here..."
            />
            {formErrors.body && (
              <p className="text-xs text-red-500">{formErrors.body}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsComposeOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              <Send size={14} className="mr-2" />
              {submitting ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════════ */}
      {/* ── BULK SEND MODAL ── */}
      {/* ══════════════════════════════════════════════ */}

      <Modal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Send Email"
        description="Send the same email to multiple student parents"
      >
        <form onSubmit={handleSendBulk} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {formError}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-600 flex items-center gap-2">
              <CheckCheck size={14} />
              {success}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Recipients <span className="text-red-500">*</span>
            </Label>
            {formErrors.studentIds && (
              <p className="text-xs text-red-500">{formErrors.studentIds}</p>
            )}
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {students.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={() => toggleStudentSelection(s.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {s.parentEmail}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {selectedStudentIds.length} student(s) selected
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Email subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (formErrors.subject)
                  setFormErrors((p) => ({ ...p, subject: null }));
              }}
              className={formErrors.subject ? 'border-red-300' : ''}
            />
            {formErrors.subject && (
              <p className="text-xs text-red-500">{formErrors.subject}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Body <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={body}
              onChange={(html) => {
                setBody(html);
                if (formErrors.body)
                  setFormErrors((p) => ({ ...p, body: null }));
              }}
              error={!!formErrors.body}
              placeholder="Write your email here..."
            />
            {formErrors.body && (
              <p className="text-xs text-red-500">{formErrors.body}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              <Send size={14} className="mr-2" />
              {submitting ? 'Sending...' : 'Send to All'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
