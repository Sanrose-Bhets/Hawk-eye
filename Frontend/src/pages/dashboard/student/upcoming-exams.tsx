import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { moduleApi } from '@/lib/api/modules';
import type { Module } from '@/lib/types';

interface ScheduledExam {
  id: string;
  moduleCode: string;
  moduleName: string;
  date: string;
  time: string;
  venue: string;
  format: string;
}

export default function UpcomingExamsPage() {
  const [exams, setExams] = useState<ScheduledExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        const res = await moduleApi.list({ limit: 20 });
        const modules: Module[] = res.data?.data || [];

        const dates = [
          '18 SEP 2026',
          '22 SEP 2026',
          '26 SEP 2026',
          '30 SEP 2026',
        ];
        const times = ['10:00 - 13:00', '14:00 - 17:00'];
        const venues = ['HALL A (LEVEL 3)', 'HALL B (LEVEL 4)', 'IT LAB 1'];

        const mapped: ScheduledExam[] = modules.map((m, idx) => ({
          id: m.id,
          moduleCode: m.code || `CS${6000 + idx + 1}`,
          moduleName: m.name,
          date: dates[idx % dates.length],
          time: times[idx % times.length],
          venue: venues[idx % venues.length],
          format: 'WRITTEN EXAMINATION',
        }));

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
      e.moduleCode.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase()),
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
            No examinations matched your filter query.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
            <div className="col-span-2">INDEX / CODE</div>
            <div className="col-span-5">COURSE MODULE</div>
            <div className="col-span-2">DATE</div>
            <div className="col-span-1">TIME</div>
            <div className="col-span-2 text-right">VENUE</div>
          </div>

          {filteredExams.map((exam, i) => (
            <div
              key={exam.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 font-mono text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="text-gray-300">0{i + 1}</span>
                <span className="text-primary font-semibold">
                  {exam.moduleCode}
                </span>
              </div>

              <div className="col-span-5">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                  {exam.moduleName}
                </h3>
                <span className="text-[10px] font-mono text-gray-400 font-sans">
                  {exam.format}
                </span>
              </div>

              <div className="col-span-2 font-mono text-xs text-gray-700">
                {exam.date}
              </div>

              <div className="col-span-1 font-mono text-xs text-gray-700">
                {exam.time}
              </div>

              <div className="col-span-2 font-mono text-xs font-bold text-gray-900 md:text-right">
                {exam.venue}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
