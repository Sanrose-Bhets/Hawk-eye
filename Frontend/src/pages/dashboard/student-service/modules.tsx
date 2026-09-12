import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const INITIAL_MODULES = [
  {
    id: 'MOD-101',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    credits: 4,
    instructor: 'Dr. Sarah Connor',
    department: 'Computer Science',
    status: 'Active',
  },
  {
    id: 'MOD-102',
    code: 'CS204',
    name: 'Data Structures and Algorithms',
    credits: 4,
    instructor: 'Prof. Alan Turing',
    department: 'Computer Science',
    status: 'Active',
  },
  {
    id: 'MOD-103',
    code: 'MATH101',
    name: 'Linear Algebra & Calculus',
    credits: 3,
    instructor: 'Dr. Katherine Johnson',
    department: 'Mathematics',
    status: 'Active',
  },
  {
    id: 'MOD-104',
    code: 'ENG201',
    name: 'Technical Writing & Communication',
    credits: 2,
    instructor: 'Prof. Maya Angelou',
    department: 'Humanities',
    status: 'Active',
  },
  {
    id: 'MOD-105',
    code: 'PHY102',
    name: 'Physics for Engineers',
    credits: 4,
    instructor: 'Dr. Richard Feynman',
    department: 'Physics',
    status: 'Active',
  },
  {
    id: 'MOD-106',
    code: 'CS305',
    name: 'Database Systems & Cloud Computing',
    credits: 4,
    instructor: 'Dr. Grace Hopper',
    department: 'Computer Science',
    status: 'Active',
  },
];

export default function ModulesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = INITIAL_MODULES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Module Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure curriculum courses, module codes, credits, and faculty
            assignments
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search modules by code, title, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((mod) => (
          <Card key={mod.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 font-mono">
                  {mod.code}
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {mod.status}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mt-3 text-base leading-snug">
                {mod.name}
              </h3>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">
                    {mod.department}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Instructor</span>
                  <span className="font-medium text-gray-900">
                    {mod.instructor}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Credits</span>
                  <span className="font-semibold text-primary">
                    {mod.credits} CR
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
