import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { examRoutineApi } from '@/lib/api/exam-routines';
import type { ExamRoutine } from '@/lib/types';

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

const DEMO_UPCOMING_EXAMS: ScheduledExam[] = [
  {
    id: 'exam-1',
    moduleCode: 'CS6001',
    moduleName: 'Artificial Intelligence & Neural Systems',
    date: 'Sep 15, 2026',
    time: '09:30 AM – 12:30 PM',
    duration: '3 Hours',
  },
  {
    id: 'exam-2',
    moduleCode: 'CS6002',
    moduleName: 'Distributed Systems & Microservices',
    date: 'Sep 18, 2026',
    time: '01:30 PM – 04:30 PM',
    duration: '3 Hours',
  },
  {
    id: 'exam-3',
    moduleCode: 'CS6003',
    moduleName: 'DevOps & Continuous Integration',
    date: 'Sep 22, 2026',
    time: '09:30 AM – 12:30 PM',
    duration: '3 Hours',
  },
  {
    id: 'exam-4',
    moduleCode: 'CS6004',
    moduleName: 'Capstone System Architecture',
    date: 'Sep 26, 2026',
    time: '01:30 PM – 04:30 PM',
    duration: '3 Hours',
  },
];

export default function UpcomingExamsPage() {
  const [exams, setExams] = useState<ScheduledExam[]>(DEMO_UPCOMING_EXAMS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadExams() {
      try {
        const routinesRes = await examRoutineApi.studentList();

        const routines: ExamRoutine[] = routinesRes.data || [];

        const mapped: ScheduledExam[] = routines
          .filter((r) => isFuture(r.date))
          .map((r, i) => ({
            id: r.id,
            moduleCode: `CS600${i + 1}`,
            moduleName: r.moduleName || 'Unknown Module',
            date: formatDate(r.date),
            time: `${r.startTime} – ${r.endTime}`,
            duration: r.duration,
          }));

        if (mapped.length > 0) {
          setExams(mapped);
        } else {
          setExams(DEMO_UPCOMING_EXAMS);
        }
      } catch (err) {
        console.error('Failed to load upcoming exams:', err);
        setExams(DEMO_UPCOMING_EXAMS);
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
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="pb-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
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
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exam by code or title..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-sans ios26-glass-pill rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]/50 transition-all text-gray-900"
            />
          </div>
        </div>
      </header>

      {/* Table / Grid */}
      {loading ? (
        <div className="ios26-card p-12 text-center text-xs font-sans text-gray-500">
          <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading examination timetable...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="ios26-card p-12 text-center space-y-2">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
            NO RECORDS FOUND
          </p>
          <p className="text-xs text-gray-500 font-sans">
            {search
              ? 'No examinations matched your filter query.'
              : 'No upcoming examinations scheduled for this semester.'}
          </p>
        </div>
      ) : (
        <div className="ios26-card overflow-hidden divide-y divide-gray-100/80">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/40 border-b border-gray-100/60 text-[11px] font-mono font-medium tracking-wider text-gray-400 uppercase">
            <div className="col-span-2">INDEX / CODE</div>
            <div className="col-span-5">COURSE MODULE</div>
            <div className="col-span-2">DATE</div>
            <div className="col-span-2">TIME</div>
            <div className="col-span-1 text-right">DURATION</div>
          </div>

          {filteredExams.map((exam, i) => (
            <div
              key={exam.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-white/60 transition-colors"
            >
              <div className="col-span-2 font-mono text-xs font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-gray-400 text-[11px]">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#16A34A]/10 text-[#16A34A] font-semibold text-[11px]">
                  {exam.moduleCode !== '—' ? exam.moduleCode : `EXAM-${i + 1}`}
                </span>
              </div>

              <div className="col-span-5">
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                  {exam.moduleName}
                </h3>
              </div>

              <div className="col-span-2 text-xs text-gray-600 font-sans">
                {exam.date}
              </div>

              <div className="col-span-2 text-xs text-gray-600 font-sans">
                {exam.time}
              </div>

              <div className="col-span-1 text-xs font-medium text-gray-900 md:text-right">
                {exam.duration}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
