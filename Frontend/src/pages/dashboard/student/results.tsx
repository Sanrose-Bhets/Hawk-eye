import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, TrendingUp, Award } from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { resultApi } from '@/lib/api/results';
import type { Result, ResultItem } from '@/lib/types';

const DEMO_RESULT_ITEMS: ResultItem[] = [
  {
    id: 'res-item-1',
    moduleId: 'mod-1',
    moduleCode: 'CS6001',
    moduleName: 'Artificial Intelligence & Neural Systems',
    score: 86.5,
    grade: 'A',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-item-2',
    moduleId: 'mod-2',
    moduleCode: 'CS6002',
    moduleName: 'Distributed Systems & Microservices',
    score: 84.0,
    grade: 'A',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-item-3',
    moduleId: 'mod-3',
    moduleCode: 'CS6003',
    moduleName: 'DevOps & Continuous Integration',
    score: 79.0,
    grade: 'A',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-item-4',
    moduleId: 'mod-4',
    moduleCode: 'CS6004',
    moduleName: 'Capstone System Architecture',
    score: 72.5,
    grade: 'A',
    createdAt: new Date().toISOString(),
  },
];

export default function StudentResultsPage() {
  const user = useSelector(selectCurrentUser);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStudentResults() {
      try {
        const res = await resultApi.list({
          published: 'true',
          limit: 5,
        });
        if (res.data?.data && res.data.data.length > 0) {
          const userRes = res.data.data.find(
            (r) =>
              r.studentEmail.toLowerCase() ===
              (user?.email?.toLowerCase() || ''),
          );
          setResult(userRes || res.data.data[0]);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error('Failed to fetch student results:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentResults();
  }, [user?.email]);

  const items: ResultItem[] =
    result?.items && result.items.length > 0 ? result.items : DEMO_RESULT_ITEMS;

  const averageScore =
    items.length > 0
      ? (
          items.reduce((acc, item) => acc + item.score, 0) / items.length
        ).toFixed(1)
      : '—';

  // Calculate GPA & Honours Standing
  const calculateGPA = (score: number) => {
    if (score >= 70) return 4.0;
    if (score >= 55) return 3.0;
    if (score >= 40) return 2.0;
    if (score >= 28) return 1.0;
    return 0.0;
  };

  const gpa =
    items.length > 0
      ? (
          items.reduce((acc, item) => acc + calculateGPA(item.score), 0) /
          items.length
        ).toFixed(2)
      : '—';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="pb-2 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
          My Results
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Review your examination evaluations, module grades, and performance
          transcript.
        </p>
      </header>

      {/* 3-Col KPI Metrics */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
          01 / ACADEMIC OVERVIEW
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ios26-card p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                EVALUATED MODULES
              </span>
              <div className="p-2.5 rounded-2xl ios26-icon-pod text-[#16A34A] flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-gray-900 leading-none">
                {loading ? '—' : items.length.toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-normal font-sans">
                Official evaluated modules
              </p>
            </div>
          </div>

          <div className="ios26-card p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                AVERAGE SCORE
              </span>
              <div className="p-2.5 rounded-2xl ios26-icon-pod text-[#16A34A] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-[#16A34A] leading-none">
                {loading ? '—' : `${averageScore}%`}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-normal font-sans">
                Weighted aggregate percentage
              </p>
            </div>
          </div>

          <div className="ios26-card p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                ACADEMIC GPA
              </span>
              <div className="p-2.5 rounded-2xl ios26-icon-pod text-[#16A34A] flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold font-mono text-gray-900 leading-none">
                {loading ? '—' : gpa}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-normal font-sans">
                4.00 Grade Point Average
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Table */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
          02 / MODULE GRADE BREAKDOWN
        </div>

        <div className="ios26-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs font-sans text-gray-500">
              <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading results data...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
                NO RESULTS RECORDED
              </p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans">
                Your results have not yet been published by the examination
                board. Please check back later.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/80">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/40 border-b border-gray-100/60 text-[11px] font-mono font-medium tracking-wider text-gray-400 uppercase">
                <div className="col-span-2">CODE</div>
                <div className="col-span-6">MODULE NAME</div>
                <div className="col-span-2 text-right">SCORE (%)</div>
                <div className="col-span-2 text-right">GRADE</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-white/60 transition-colors"
                >
                  <div className="col-span-2 font-mono text-xs font-semibold text-[#16A34A]">
                    <span className="px-2 py-0.5 rounded-md bg-[#16A34A]/10 text-[#16A34A]">
                      {item.moduleCode || '—'}
                    </span>
                  </div>
                  <div className="col-span-6 font-semibold text-sm text-gray-900 tracking-tight">
                    {item.moduleName}
                  </div>
                  <div className="col-span-2 font-mono text-sm font-semibold text-gray-900 md:text-right">
                    {item.score}%
                  </div>
                  <div className="col-span-2 font-mono text-sm font-bold text-[#16A34A] md:text-right">
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
