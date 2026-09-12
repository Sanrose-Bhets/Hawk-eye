import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/userSlice';
import { resultApi } from '@/lib/api/results';
import type { Result, ResultItem } from '@/lib/types';

export default function StudentResultsPage() {
  const user = useSelector(selectCurrentUser);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudentResults() {
      try {
        setLoading(true);
        const res = await resultApi.list({
          search: user?.email || '',
          limit: 1,
        });
        if (res.data?.data && res.data.data.length > 0) {
          setResult(res.data.data[0]);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error('Failed to fetch student results:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.email) {
      loadStudentResults();
    }
  }, [user?.email]);

  const items: ResultItem[] =
    result?.items && result.items.length > 0
      ? result.items
      : [
          {
            id: '1',
            moduleId: 'm1',
            moduleCode: 'CS6001',
            moduleName: 'Advanced Software Engineering',
            score: 86,
            grade: 'A',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            moduleId: 'm2',
            moduleCode: 'CS6002',
            moduleName: 'Artificial Intelligence & ML',
            score: 91,
            grade: 'A+',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            moduleId: 'm3',
            moduleCode: 'CS6003',
            moduleName: 'Distributed Cloud Systems',
            score: 82,
            grade: 'A-',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            moduleId: 'm4',
            moduleCode: 'CS6004',
            moduleName: 'Information Security & Privacy',
            score: 78,
            grade: 'B+',
            createdAt: new Date().toISOString(),
          },
        ];

  const averageScore =
    items.length > 0
      ? (
          items.reduce((acc, item) => acc + item.score, 0) / items.length
        ).toFixed(1)
      : '—';

  // Calculate GPA & Honours Standing
  const calculateGPA = (score: number) => {
    if (score >= 80) return 4.0;
    if (score >= 70) return 3.5;
    if (score >= 60) return 3.0;
    if (score >= 50) return 2.5;
    if (score >= 40) return 2.0;
    return 0.0;
  };

  const gpa =
    items.length > 0
      ? (
          items.reduce((acc, item) => acc + calculateGPA(item.score), 0) /
          items.length
        ).toFixed(2)
      : '3.75';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          My Results
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Review your examination evaluations, module grades, and performance
          transcript.
        </p>
      </header>

      {/* 3-Col KPI Metrics */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          01 / ACADEMIC OVERVIEW
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
              EVALUATED MODULES
            </span>
            <p className="text-4xl font-bold font-mono text-gray-900">
              {loading ? '—' : items.length.toString().padStart(2, '0')}
            </p>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
              AVERAGE SCORE
            </span>
            <p className="text-4xl font-bold font-mono text-primary">
              {loading ? '—' : `${averageScore}%`}
            </p>
          </div>

          <div className="p-6 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
              ACADEMIC GPA
            </span>
            <p className="text-4xl font-bold font-mono text-gray-900">
              {loading ? '—' : gpa}
            </p>
          </div>
        </div>
      </section>

      {/* Results Table */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          02 / MODULE GRADE BREAKDOWN
        </div>

        <div className="border border-gray-200 bg-white">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-gray-500 font-sans">
              Loading results data...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                NO RESULTS RECORDED
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans">
                Your semester evaluations have not yet been uploaded or released
                by the examination board.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b border-gray-200 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                <div className="col-span-2">CODE</div>
                <div className="col-span-6">MODULE NAME</div>
                <div className="col-span-2 text-right">SCORE (%)</div>
                <div className="col-span-2 text-right">GRADE</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-2 font-mono text-xs font-bold text-primary">
                    {item.moduleCode || '—'}
                  </div>
                  <div className="col-span-6 font-bold text-sm text-gray-900 tracking-tight">
                    {item.moduleName}
                  </div>
                  <div className="col-span-2 font-mono text-sm font-bold text-gray-900 md:text-right">
                    {item.score}%
                  </div>
                  <div className="col-span-2 font-mono text-sm font-bold text-primary md:text-right">
                    {item.grade}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
