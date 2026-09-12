import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  UserCheck,
  ListFilter,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Tooltip } from '@/components/ui/tooltip';
import { studentStorage, type Student } from '@/lib/api/students';

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Cybersecurity',
  'Mathematics',
];

const YEAR_LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected student
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState(DEPARTMENTS[0]);
  const [formYearLevel, setFormYearLevel] = useState(YEAR_LEVELS[0]);
  const [formError, setFormError] = useState('');

  // Load students on mount
  useEffect(() => {
    setStudents(studentStorage.list());
  }, []);

  // Filtered students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      const matchesFaculty =
        selectedFaculty === 'ALL' || s.department === selectedFaculty;

      return matchesSearch && matchesFaculty;
    });
  }, [students, searchQuery, selectedFaculty]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment(DEPARTMENTS[0]);
    setFormYearLevel(YEAR_LEVELS[0]);
    setFormError('');
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormPhone(student.phone);
    setFormDepartment(student.department);
    setFormYearLevel(student.yearLevel);
    setFormError('');
    setIsEditOpen(true);
  };

  // Open Details Modal
  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Please fill in student name and email address.');
      return;
    }

    const created = studentStorage.create({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || '+977 9800000000',
      department: formDepartment,
      yearLevel: formYearLevel,
      status: 'Active',
    });

    setStudents([created, ...students]);
    setIsCreateOpen(false);
  };

  // Submit Edit
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Please fill in student name and email address.');
      return;
    }

    const updated = studentStorage.update(selectedStudent.id, {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      department: formDepartment,
      yearLevel: formYearLevel,
    });

    if (updated) {
      setStudents(
        students.map((s) => (s.id === selectedStudent.id ? updated : s)),
      );
      setIsEditOpen(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (!selectedStudent) return;
    studentStorage.delete(selectedStudent.id);
    setStudents(students.filter((s) => s.id !== selectedStudent.id));
    setIsDeleteOpen(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Students Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, view, edit, and organize student records
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="cursor-pointer">
          <Plus size={18} className="mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search & Faculty Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Search by name, email, or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
          />
        </div>

        {/* Search Button */}
        <Button
          type="button"
          onClick={() => {}}
          className="h-10 px-4 text-sm font-medium rounded-xl cursor-pointer shrink-0"
        >
          <Search size={15} className="mr-1.5" />
          Search
        </Button>

        {/* Faculty Filter Dropdown */}
        <div className="relative w-full sm:w-auto shrink-0">
          <div className="relative inline-flex w-full sm:w-48 items-center">
            <ListFilter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary-ring focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Faculties</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
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
              filteredStudents.map((student) => (
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
                        <span className="text-xs font-mono font-medium text-primary bg-primary-light/60 px-2 py-0.5 rounded-md">
                          {student.studentCode}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {student.email}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {student.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 shrink-0 pl-14 sm:pl-0">
                    <Tooltip content="View Student Details" side="top">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetail(student)}
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
                        onClick={() => handleOpenDelete(student)}
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
              onChange={(e) => setFormName(e.target.value)}
              required
            />
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
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="createPhone">Phone Number</Label>
            <Input
              id="createPhone"
              placeholder="e.g. +977 9812345678"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="createDept" required>
                Department
              </Label>
              <select
                id="createDept"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="createYear" required>
                Year Level
              </Label>
              <select
                id="createYear"
                value={formYearLevel}
                onChange={(e) => setFormYearLevel(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
              >
                {YEAR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Student</Button>
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
            <Label htmlFor="editName" required>
              Full Name
            </Label>
            <Input
              id="editName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editEmail" required>
              Email Address
            </Label>
            <Input
              id="editEmail"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editPhone">Phone Number</Label>
            <Input
              id="editPhone"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editDept" required>
                Department
              </Label>
              <select
                id="editDept"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editYear" required>
                Year Level
              </Label>
              <select
                id="editYear"
                value={formYearLevel}
                onChange={(e) => setFormYearLevel(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-ring cursor-pointer"
              >
                {YEAR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
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
                  {selectedStudent.studentCode}
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
                  <Phone size={13} /> Phone Number
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.phone || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Building2 size={13} /> Department
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.department}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <GraduationCap size={13} /> Year Level
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.yearLevel}
                </p>
              </div>

              <div className="space-y-1 col-span-2">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar size={13} /> Enrolled Date
                </span>
                <p className="font-medium text-gray-900">
                  {selectedStudent.enrolledAt}
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
        description="Are you sure you want to delete this student record?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently remove{' '}
            <strong className="text-gray-900 font-semibold">
              {selectedStudent?.name}
            </strong>{' '}
            ({selectedStudent?.studentCode}) from the student directory.
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
