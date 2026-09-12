import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
} from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Tooltip } from '@/components/ui/tooltip';
import {
  studentApi,
  type CreateStudentData,
  type UpdateStudentData,
} from '@/lib/api/students';
import { facultyApi } from '@/lib/api/faculties';
import type { Student, Faculty } from '@/lib/types';

const PAGE_LIMIT = 10;

function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
  return null;
}

function validateContact(value: string): string | null {
  if (!value.trim()) return 'Contact number is required';
  if (!/^[+]?[\d\s-]{7,15}$/.test(value.replace(/\s/g, '')))
    return 'Invalid contact number';
  return null;
}

function validateName(value: string): string | null {
  if (!value.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}

function validateAddress(value: string): string | null {
  if (!value.trim()) return 'Address is required';
  return null;
}

function validateParentEmail(value: string): string | null {
  if (!value.trim()) return 'Parent email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Invalid parent email format';
  return null;
}

interface FormErrors {
  name?: string | null;
  email?: string | null;
  contact?: string | null;
  address?: string | null;
  parentEmail?: string | null;
  faculty?: string | null;
}

function validateForm(fields: {
  name: string;
  email: string;
  contact: string;
  address: string;
  parentEmail: string;
  facultyId: string;
}): FormErrors {
  return {
    name: validateName(fields.name) || undefined,
    email: validateEmail(fields.email) || undefined,
    contact: validateContact(fields.contact) || undefined,
    address: validateAddress(fields.address) || undefined,
    parentEmail: validateParentEmail(fields.parentEmail) || undefined,
    faculty: !fields.facultyId ? 'Faculty is required' : undefined,
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formFacultyId, setFormFacultyId] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CreateStudentData[]>([]);
  const [csvError, setCsvError] = useState('');
  const [importResult, setImportResult] = useState<{
    created: number;
    errors: { email: string; reason: string }[];
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = useCallback(
    async (search?: string, pageNum?: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await studentApi.list({
          page: pageNum ?? page,
          limit: PAGE_LIMIT,
          search: (search ?? searchQuery) || undefined,
        });
        setStudents(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch {
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery],
  );

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    facultyApi.list().then((res) => setFaculties(res.data.data));
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchStudents(value, 1);
    }, 400);
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormAddress('');
    setFormContact('');
    setFormParentEmail('');
    setFormFacultyId('');
    setFormErrors({});
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormAddress(student.address);
    setFormContact(student.contact);
    setFormParentEmail(student.parentEmail);
    setFormFacultyId(student.facultyId || '');
    setFormErrors({});
    setFormError('');
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateForm({
      name: formName,
      email: formEmail,
      contact: formContact,
      address: formAddress,
      parentEmail: formParentEmail,
      facultyId: formFacultyId,
    });
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      await studentApi.create({
        name: formName.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        contact: formContact.trim(),
        parentEmail: formParentEmail.trim(),
        facultyId: formFacultyId || undefined,
      });
      setIsCreateOpen(false);
      fetchStudents();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })
        .response?.data;
      setFormError(data?.message || 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const errors: FormErrors = {};
    if (formName.trim()) errors.name = validateName(formName);
    if (formEmail.trim()) errors.email = validateEmail(formEmail);
    if (formContact.trim()) errors.contact = validateContact(formContact);
    if (formAddress.trim()) errors.address = validateAddress(formAddress);
    if (formParentEmail.trim())
      errors.parentEmail = validateParentEmail(formParentEmail);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    setSubmitting(true);
    setFormError('');
    try {
      const data: UpdateStudentData = {};
      if (formName.trim()) data.name = formName.trim();
      if (formEmail.trim()) data.email = formEmail.trim();
      if (formAddress.trim()) data.address = formAddress.trim();
      if (formContact.trim()) data.contact = formContact.trim();
      if (formParentEmail.trim()) data.parentEmail = formParentEmail.trim();
      data.facultyId = formFacultyId || undefined;

      await studentApi.update(selectedStudent.id, data);
      setIsEditOpen(false);
      fetchStudents();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })
        .response?.data;
      setFormError(data?.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await studentApi.delete(selectedStudent.id);
      setIsDeleteOpen(false);
      fetchStudents();
    } catch {
      setError('Failed to delete student.');
    } finally {
      setSubmitting(false);
    }
  };

  const parseCsv = (text: string): CreateStudentData[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const required = ['name', 'email', 'address', 'contact', 'parentemail'];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return {
        name: row.name,
        email: row.email,
        address: row.address,
        contact: row.contact,
        parentEmail: row.parentemail || row.parent_email || '',
      };
    });
  };

  const handleCsvUpload = (file: File) => {
    setCsvError('');
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCsv(text);
        if (parsed.length === 0) {
          setCsvError('No student data found in CSV.');
          return;
        }
        const csvErrors: string[] = [];
        parsed.forEach((s, i) => {
          if (validateName(s.name))
            csvErrors.push(`Row ${i + 1}: invalid name`);
          if (validateEmail(s.email))
            csvErrors.push(`Row ${i + 1}: invalid email`);
          if (validateContact(s.contact))
            csvErrors.push(`Row ${i + 1}: invalid contact`);
          if (validateAddress(s.address))
            csvErrors.push(`Row ${i + 1}: invalid address`);
          if (validateParentEmail(s.parentEmail))
            csvErrors.push(`Row ${i + 1}: invalid parent email`);
        });
        if (csvErrors.length > 0) {
          setCsvError(csvErrors.join('. '));
          return;
        }
        setCsvPreview(parsed);
      } catch (err) {
        setCsvError(
          err instanceof Error ? err.message : 'Failed to parse CSV.',
        );
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (csvPreview.length === 0) return;
    setSubmitting(true);
    setCsvError('');
    try {
      const res = await studentApi.import(csvPreview);
      setImportResult(res.data);
      if (res.data.created > 0) {
        fetchStudents();
      }
    } catch {
      setCsvError('Import failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetImport = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setCsvError('');
    setImportResult(null);
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Students Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, view, edit, and organize student records
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
            Add Student
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

      <div className="relative w-full">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <Input
          placeholder="Search by name, email, or contact..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
        />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="py-16 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                  <UserCheck size={24} />
                </div>
                <p className="text-base font-medium text-gray-900">
                  No students found
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {searchQuery
                    ? `No students matching "${searchQuery}"`
                    : 'Click "Add Student" to create your first student record'}
                </p>
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-gray-50/80 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary font-bold text-sm">
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {student.name}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {student.email}
                        </span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {student.contact}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 shrink-0 pl-14 sm:pl-0">
                    <Tooltip content="View Student Details" side="top">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDetailOpen(true);
                        }}
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 cursor-pointer"
                      >
                        <Eye size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit Student" side="top">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(student)}
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 cursor-pointer"
                      >
                        <Pencil size={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete Student" side="top">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_LIMIT + 1}-
            {Math.min(page * PAGE_LIMIT, total)} of {total} students
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-3 py-1 text-sm font-medium text-gray-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* CREATE STUDENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Student"
        description="Fill in the student details to enroll them in the directory"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="createName" required>
              Full Name
            </Label>
            <Input
              id="createName"
              placeholder="e.g. Alex Morgan"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (formErrors.name)
                  setFormErrors((p) => ({ ...p, name: undefined }));
              }}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createEmail" required>
              Email Address
            </Label>
            <Input
              id="createEmail"
              type="email"
              placeholder="e.g. alex.morgan@example.com"
              value={formEmail}
              onChange={(e) => {
                setFormEmail(e.target.value);
                if (formErrors.email)
                  setFormErrors((p) => ({ ...p, email: undefined }));
              }}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createContact" required>
              Contact Number
            </Label>
            <Input
              id="createContact"
              placeholder="e.g. +977-9841234567"
              value={formContact}
              onChange={(e) => {
                setFormContact(e.target.value);
                if (formErrors.contact)
                  setFormErrors((p) => ({ ...p, contact: undefined }));
              }}
            />
            {formErrors.contact && (
              <p className="text-xs text-red-500">{formErrors.contact}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createAddress" required>
              Address
            </Label>
            <Input
              id="createAddress"
              placeholder="e.g. Kathmandu, Nepal"
              value={formAddress}
              onChange={(e) => {
                setFormAddress(e.target.value);
                if (formErrors.address)
                  setFormErrors((p) => ({ ...p, address: undefined }));
              }}
            />
            {formErrors.address && (
              <p className="text-xs text-red-500">{formErrors.address}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createParentEmail" required>
              Parent Email
            </Label>
            <Input
              id="createParentEmail"
              type="email"
              placeholder="e.g. parent@example.com"
              value={formParentEmail}
              onChange={(e) => {
                setFormParentEmail(e.target.value);
                if (formErrors.parentEmail)
                  setFormErrors((p) => ({ ...p, parentEmail: undefined }));
              }}
            />
            {formErrors.parentEmail && (
              <p className="text-xs text-red-500">{formErrors.parentEmail}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createFaculty" required>
              Faculty
            </Label>
            <select
              id="createFaculty"
              value={formFacultyId}
              onChange={(e) => setFormFacultyId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
            >
              <option value="" disabled>
                Select a faculty
              </option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {formErrors.faculty && (
              <p className="text-xs text-red-500">{formErrors.faculty}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Record"
        description={`Modify information for ${selectedStudent?.name || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="editName">Full Name</Label>
            <Input
              id="editName"
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (formErrors.name)
                  setFormErrors((p) => ({ ...p, name: undefined }));
              }}
            />
            {formErrors.name && (
              <p className="text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editEmail">Email Address</Label>
            <Input
              id="editEmail"
              type="email"
              value={formEmail}
              onChange={(e) => {
                setFormEmail(e.target.value);
                if (formErrors.email)
                  setFormErrors((p) => ({ ...p, email: undefined }));
              }}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editContact">Contact Number</Label>
            <Input
              id="editContact"
              value={formContact}
              onChange={(e) => {
                setFormContact(e.target.value);
                if (formErrors.contact)
                  setFormErrors((p) => ({ ...p, contact: undefined }));
              }}
            />
            {formErrors.contact && (
              <p className="text-xs text-red-500">{formErrors.contact}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editAddress">Address</Label>
            <Input
              id="editAddress"
              value={formAddress}
              onChange={(e) => {
                setFormAddress(e.target.value);
                if (formErrors.address)
                  setFormErrors((p) => ({ ...p, address: undefined }));
              }}
            />
            {formErrors.address && (
              <p className="text-xs text-red-500">{formErrors.address}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editParentEmail">Parent Email</Label>
            <Input
              id="editParentEmail"
              type="email"
              value={formParentEmail}
              onChange={(e) => {
                setFormParentEmail(e.target.value);
                if (formErrors.parentEmail)
                  setFormErrors((p) => ({ ...p, parentEmail: undefined }));
              }}
            />
            {formErrors.parentEmail && (
              <p className="text-xs text-red-500">{formErrors.parentEmail}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editFaculty">Faculty</Label>
            <select
              id="editFaculty"
              value={formFacultyId}
              onChange={(e) => setFormFacultyId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
            >
              <option value="" disabled>
                Select a faculty
              </option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* STUDENT DETAIL MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Profile"
        description="Comprehensive information and enrollment record"
      >
        {selectedStudent && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-bold text-xl">
                {selectedStudent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  {selectedStudent.name}
                </h4>
                <p className="text-xs font-mono text-primary font-semibold mt-0.5">
                  {selectedStudent.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} /> Email Address
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.email}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} /> Contact Number
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.contact}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <MapPin size={13} /> Address
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.address}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail size={13} /> Parent Email
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.parentEmail}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <GraduationCap size={13} /> Faculty
                </span>
                <p className="font-medium text-gray-900">
                  {faculties.find((f) => f.id === selectedStudent.facultyId)
                    ?.name || '—'}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar size={13} /> Created At
                </span>
                <p className="font-medium text-gray-900">
                  {new Date(selectedStudent.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenEdit(selectedStudent);
                }}
              >
                <Pencil size={14} className="mr-1.5" />
                Edit Profile
              </Button>
              <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Student"
        description="Are you sure you want to delete this student?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently remove{' '}
            <strong className="text-gray-900 font-semibold">
              {selectedStudent?.name}
            </strong>{' '}
            ({selectedStudent?.email}) from the student directory.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Deleting...' : 'Delete Student'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* IMPORT CSV MODAL */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          resetImport();
        }}
        title="Import Students from CSV"
        description="Upload a CSV file with student data"
      >
        <div className="space-y-4">
          {!importResult ? (
            <>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <FileSpreadsheet
                  size={32}
                  className="mx-auto mb-2 text-gray-400"
                />
                <p className="text-sm text-gray-600 mb-3">
                  {csvFile
                    ? csvFile.name
                    : 'Drag & drop or click to select a CSV file'}
                </p>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCsvFile(file);
                      handleCsvUpload(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => csvInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>

              {csvError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                  {csvError}
                </div>
              )}

              {csvPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Preview ({csvPreview.length} students):
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Email
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">
                            Contact
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {csvPreview.map((s, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 text-gray-900">
                              {s.name}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {s.email}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {s.contact}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsImportOpen(false);
                    resetImport();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  disabled={csvPreview.length === 0 || submitting}
                >
                  {submitting
                    ? 'Importing...'
                    : `Import ${csvPreview.length} Students`}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                  <CheckCircle2 size={16} />
                  Import Complete
                </div>
                <p className="text-green-600">
                  {importResult.created} student(s) imported successfully.
                </p>
              </div>

              {importResult.errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                    <AlertCircle size={16} />
                    {importResult.errors.length} error(s)
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-600">
                        <strong>{err.email}:</strong> {err.reason}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={() => {
                    setIsImportOpen(false);
                    resetImport();
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
