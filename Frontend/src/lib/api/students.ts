import { DUMMY_STUDENTS } from './seat-plan';

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  yearLevel: string;
  status: 'Active' | 'Enrolled' | 'Graduated' | 'Suspended';
  enrolledAt: string;
}

const STORAGE_KEY = 'hawkeye_students_v1';

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Cybersecurity',
  'Mathematics',
];

const YEAR_LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

function generateInitialStudents(): Student[] {
  return DUMMY_STUDENTS.map((s, idx) => ({
    id: s.id,
    studentCode: `STU-${String(idx + 101).padStart(4, '0')}`,
    name: s.name,
    email: s.email,
    phone: `+977 98${Math.floor(10000000 + Math.random() * 90000000)}`,
    department: DEPARTMENTS[idx % DEPARTMENTS.length],
    yearLevel: YEAR_LEVELS[idx % YEAR_LEVELS.length],
    status: (idx % 8 === 0 ? 'Enrolled' : 'Active') as Student['status'],
    enrolledAt: '2024-09-01',
  }));
}

export const studentStorage = {
  list: (): Student[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = generateInitialStudents();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored) as Student[];
    } catch {
      return generateInitialStudents();
    }
  },

  get: (id: string): Student | undefined => {
    const list = studentStorage.list();
    return list.find((s) => s.id === id);
  },

  create: (
    data: Omit<Student, 'id' | 'studentCode' | 'enrolledAt'>,
  ): Student => {
    const list = studentStorage.list();
    const newId = String(Date.now());
    const studentCode = `STU-${String(list.length + 101).padStart(4, '0')}`;
    const newStudent: Student = {
      ...data,
      id: newId,
      studentCode,
      enrolledAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newStudent, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newStudent;
  },

  update: (
    id: string,
    data: Partial<Omit<Student, 'id' | 'studentCode'>>,
  ): Student | null => {
    const list = studentStorage.list();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const updatedStudent: Student = { ...list[index], ...data };
    list[index] = updatedStudent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updatedStudent;
  },

  delete: (id: string): boolean => {
    const list = studentStorage.list();
    const filtered = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  reset: (): Student[] => {
    const initial = generateInitialStudents();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  },
};
