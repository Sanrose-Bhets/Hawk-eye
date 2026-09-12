import { useState } from 'react';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const EXAM_RESULTS = [
  {
    id: 'RES-01',
    term: 'Fall 2025 Final Examination',
    module: 'CS101 - Introduction to Computer Science',
    totalCandidates: 24,
    passedCount: 22,
    averageGpa: '3.62',
    status: 'Published',
    date: 'Jan 15, 2026',
  },
  {
    id: 'RES-02',
    term: 'Fall 2025 Final Examination',
    module: 'CS204 - Data Structures and Algorithms',
    totalCandidates: 18,
    passedCount: 17,
    averageGpa: '3.48',
    status: 'Published',
    date: 'Jan 18, 2026',
  },
  {
    id: 'RES-03',
    term: 'Spring 2026 Midterms',
    module: 'MATH101 - Linear Algebra & Calculus',
    totalCandidates: 24,
    passedCount: 21,
    averageGpa: '3.30',
    status: 'Under Review',
    date: 'Pending',
  },
  {
    id: 'RES-04',
    term: 'Spring 2026 Midterms',
    module: 'PHY102 - Physics for Engineers',
    totalCandidates: 20,
    passedCount: 19,
    averageGpa: '3.55',
    status: 'Under Review',
    date: 'Pending',
  },
];

export default function ResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = EXAM_RESULTS.filter(
    (r) =>
      r.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.term.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Results & Evaluations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, evaluate and publish grade sheets and term examination
            results
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search by module or examination term..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {item.term}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-1 text-base">
                    {item.module}
                  </h3>
                </div>
                {item.status === 'Published' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={12} />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <AlertCircle size={12} />
                    Review
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-gray-50 text-center">
                <div>
                  <div className="text-xs text-gray-500">Students</div>
                  <div className="text-base font-bold text-gray-900 mt-0.5">
                    {item.totalCandidates}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Passed</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">
                    {item.passedCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Avg GPA</div>
                  <div className="text-base font-bold text-primary mt-0.5">
                    {item.averageGpa}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
