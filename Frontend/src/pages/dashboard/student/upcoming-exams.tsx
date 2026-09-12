import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { examRoutineApi } from '@/lib/api/exam-routines';
import { moduleApi } from '@/lib/api/modules';
import type { ExamRoutine, Module } from '@/lib/types';

interface ScheduledExam {
  id: string;
  moduleCode: string;
  moduleName: string;
  date: string;
  time: string;
  duration: string;
}

function formatDate(dateStr: string): string {
  const epochMs =
    typeof (dateStr as unknown as { epochMilliseconds?: number })
      .epochMilliseconds === 'number'
      ? (dateStr as unknown as { epochMilliseconds: number }).epochMilliseconds
      : new Date(dateStr).getTime();
  const d = new Date(epochMs);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isFuture(dateStr: string): boolean {
  const epochMs =
    typeof (dateStr as unknown as { epochMilliseconds?: number })
      .epochMilliseconds === 'number'
      ? (dateStr as unknown as { epochMilliseconds: number }).epochMilliseconds
      : new Date(dateStr).getTime();
  const d = new Date(epochMs);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

export default function UpcomingExamsPage() {
  const [exams, setExams] = useState<ScheduledExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        const [routinesRes, modulesRes] = await Promise.all([
          examRoutineApi.studentList(),
          moduleApi.list({ limit: 50 }),
        ]);

        const routines: ExamRoutine[] = routinesRes.data || [];
        const modules: Module[] = modulesRes.data?.data || [];
        const moduleMap = new Map(modules.map((m) => [m.id, m]));

        const mapped: ScheduledExam[] = routines
          .filter((r) => isFuture(r.date))
          .map((r) => {
            const mod = moduleMap.get(r.moduleId);
            return {
              id: r.id,
              moduleCode: mod?.code || '—',
              moduleName: mod?.name || 'Unknown Module',
              date: formatDate(r.date),
              time: `${r.startTime} – ${r.endTime}`,
              duration: r.duration,
            };
          });

        setExams(mapped);
      } catch (err) {
        console.error('Failed to load upcoming exams:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExams();
  }, []);

  const filteredExams = exams.filter(
    (e) =>
      e.moduleName.toLowerCase().includes(search.toLowerCase()) ||
      e.moduleCode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
              Upcoming Examinations
            </h1>
            <p className="text-sm text-gray-500 font-sans">
              Complete examination timetable, schedule, and venue details for
              this semester.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH EXAM BY CODE OR TITLE..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:border-primary rounded-[2px]"
            />
          </div>
        </div>
      </header>

      {/* Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 font-sans">
          Loading examination timetable...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="border border-gray-200 bg-white p-12 text-center space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            NO RECORDS FOUND
          </p>
          <p className="text-sm text-gray-600 font-sans">
            {search
              ? 'No examinations matched your filter query.'
              : 'No upcoming examinations scheduled for this semester.'}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b border-gray-200 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
            <div className="col-span-2">INDEX / CODE</div>
            <div className="col-span-5">COURSE MODULE</div>
            <div className="col-span-2">DATE</div>
            <div className="col-span-2">TIME</div>
            <div className="col-span-1 text-right">DURATION</div>
          </div>

          {filteredExams.map((exam, i) => (
            <div
              key={exam.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 font-mono text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="text-gray-300">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-primary font-semibold">
                  {exam.moduleCode}
                </span>
              </div>

              <div className="col-span-5">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  {exam.moduleName}
                </h3>
              </div>

              <div className="col-span-2 font-mono text-xs text-gray-700">
                {exam.date}
              </div>

              <div className="col-span-2 font-mono text-xs text-gray-700">
                {exam.time}
              </div>

              <div className="col-span-1 font-mono text-xs font-bold text-gray-900 md:text-right">
                {exam.duration}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
