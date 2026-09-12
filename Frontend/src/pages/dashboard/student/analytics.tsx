import { useState, useEffect } from 'react';
import { TrendingUp, GraduationCap, BookCheck, Filter } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { resultApi } from '@/lib/api/results';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
);

interface SemesterHistory {
  semester: string;
  year: string;
  gpa: number;
  averageScore: number;
  creditsEarned: number;
  totalCredits: number;
  standing: string;
  modules: {
    code: string;
    name: string;
    credits: number;
    score: number;
    grade: string;
    gradePoint: number;
    status: 'PASS' | 'DISTINCTION' | 'RESIT';
  }[];
}

export default function StudentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [history, setHistory] = useState<SemesterHistory[]>([]);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoading(true);
        const res = await resultApi.analytics();
        setHistory(res.data ?? []);
      } catch (err) {
        console.error('Failed to load performance analytics data:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  // Calculations across all completed semesters
  const totalCreditsCompleted = history.reduce(
    (acc, sem) => acc + sem.creditsEarned,
    0,
  );
  const totalDegreeCredits = 360; // 3-year UK undergraduate degree standard
  const cumulativeAverage =
    history.length > 0
      ? (
          history.reduce((acc, sem) => acc + sem.averageScore, 0) /
          history.length
        ).toFixed(1)
      : '0.0';

  const cumulativeGPA =
    history.length > 0
      ? (
          history.reduce((acc, sem) => acc + sem.gpa, 0) / history.length
        ).toFixed(2)
      : '0.00';

  const allModulesList = history.flatMap((s) => s.modules);
  const totalModulesPassed = allModulesList.filter(
    (m) => m.status !== 'RESIT',
  ).length;
  const passRate =
    allModulesList.length > 0
      ? ((totalModulesPassed / allModulesList.length) * 100).toFixed(0)
      : '100';

  // 2. Line Chart Data: Module Scores Progression
  const filteredModulesForChart =
    selectedSemester === 'ALL'
      ? allModulesList
      : history.find((s) => s.semester === selectedSemester)?.modules || [];

  const lineChartData = {
    labels: filteredModulesForChart.map((m) => m.code),
    datasets: [
      {
        label: 'Module Score (%)',
        data: filteredModulesForChart.map((m) => m.score),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.25,
        pointBackgroundColor: filteredModulesForChart.map((m) =>
          m.score >= 70
            ? '#16a34a'
            : m.score >= 55
              ? '#0284c7'
              : m.score >= 40
                ? '#8b5cf6'
                : m.score >= 28
                  ? '#d97706'
                  : '#dc2626',
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7.5,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        callbacks: {
          afterTitle: (items: { dataIndex: number }[]) => {
            const idx = items[0].dataIndex;
            return filteredModulesForChart[idx]?.name || '';
          },
          label: (context: { parsed: { y: number | null }; dataIndex: number }) =>
            ` Score: ${context.parsed.y ?? 0}% • Grade: ${filteredModulesForChart[context.dataIndex]?.grade}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Space Grotesk, sans-serif', size: 11 },
          color: '#4b5563',
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { family: 'Space Grotesk, sans-serif', size: 11 },
          callback: (val: string | number) => `${val}%`,
        },
        grid: { color: '#f3f4f6' },
      },
    },
  };

  // 3. Doughnut Data: Grade Distribution — 70→A, 55→B, 40→C, 28→D, <28→F
  const gradeCounts = {
    A: allModulesList.filter((m) => m.score >= 70).length,
    B: allModulesList.filter((m) => m.score >= 55 && m.score < 70).length,
    C: allModulesList.filter((m) => m.score >= 40 && m.score < 55).length,
    D: allModulesList.filter((m) => m.score >= 28 && m.score < 40).length,
    F: allModulesList.filter((m) => m.score < 28).length,
  };

  const doughnutData = {
    labels: ['A (70-100)', 'B (55-69)', 'C (40-54)', 'D (28-39)', 'F (0-27)'],
    datasets: [
      {
        data: [gradeCounts.A, gradeCounts.B, gradeCounts.C, gradeCounts.D, gradeCounts.F],
        backgroundColor: [
          '#16a34a',
          '#0284c7',
          '#8b5cf6',
          '#d97706',
          '#ef4444',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
      },
    },
    cutout: '72%',
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-16">
      {/* 1. Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          Performance Analytics
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Historical GPA progression, comparative module evaluations, and degree
          completion analytics.
        </p>
      </header>

      {/* 2. Cumulative Executive KPI Metrics */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          01 / CUMULATIVE ACADEMIC STANDING
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
          {/* Cumulative GPA */}
          <div className="p-6 flex flex-col justify-between space-y-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                CUMULATIVE GPA
              </span>
              <TrendingUp size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-3xl lg:text-[34px] font-bold tracking-tight text-primary font-mono leading-none">
                {loading ? '—' : cumulativeGPA}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-sans font-normal">
                4.00 Grade Scale • Avg Score:{' '}
                <strong>{cumulativeAverage}%</strong>
              </p>
            </div>
          </div>

          {/* Credits Completed */}
          <div className="p-6 flex flex-col justify-between space-y-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                DEGREE CREDITS
              </span>
              <GraduationCap size={15} className="text-gray-400" />
            </div>
            <div>
              <p className="text-3xl lg:text-[34px] font-bold tracking-tight text-gray-900 font-mono leading-none">
                {loading
                  ? '—'
                  : `${totalCreditsCompleted}/${totalDegreeCredits}`}
              </p>
              <div className="w-full bg-gray-100 h-1.5 mt-3 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (totalCreditsCompleted / totalDegreeCredits) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pass Rate & Resits */}
          <div className="p-6 flex flex-col justify-between space-y-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                ASSESSMENT SUCCESS
              </span>
              <BookCheck size={15} className="text-primary" />
            </div>
            <div>
              <p className="text-3xl lg:text-[34px] font-bold tracking-tight text-primary font-mono leading-none">
                {loading ? '—' : `${passRate}%`}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-sans font-normal">
                {totalModulesPassed} of {allModulesList.length} Modules Passed •
                0 Resits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Module Mark Distribution & Breakdown */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          02 / MODULE COMPARISON & HONOURS THRESHOLDS
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module Score Bar Chart (2 Cols) */}
          <div className="lg:col-span-2 border border-gray-200 bg-white p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Module Scores vs Distinction
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  A 70–100 • B 55–69 • C 40–54 • D 28–39 • F 0–27
                </p>
              </div>

              {/* Semester Filter Selector */}
              <div className="flex items-center gap-1.5 border border-gray-200 p-1 bg-gray-50 rounded-[2px] text-xs font-mono">
                <Filter size={13} className="text-gray-400 ml-1" />
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-transparent text-xs font-mono font-semibold text-gray-700 focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL">All Modules</option>
                  {history.map((s) => (
                    <option key={s.semester} value={s.semester}>
                      {s.semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs font-mono text-gray-400">
                  Loading module mark distribution...
                </div>
              ) : (
                <Line data={lineChartData} options={lineChartOptions} />
              )}
            </div>
          </div>

          {/* Grade Distribution Breakdown (1 Col) */}
          <div className="border border-gray-200 bg-white p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Grade Distribution
              </h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Breakdown of {allModulesList.length} total completed
                assessments.
              </p>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-mono font-bold text-gray-900 leading-none">
                  {gradeCounts.A}
                </span>
                <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider mt-1">
                  Grade A
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  A (70–100)
                </span>
                <span className="font-bold">{gradeCounts.A}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  B (55–69)
                </span>
                <span className="font-bold">{gradeCounts.B}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  C (40–54)
                </span>
                <span className="font-bold">{gradeCounts.C}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  D (28–39)
                </span>
                <span className="font-bold">{gradeCounts.D}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  F (0–27)
                </span>
                <span className="font-bold">{gradeCounts.F}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Historical Semester Transcripts Table */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          03 / HISTORICAL SEMESTER LOG
        </div>

        <div className="space-y-4">
          {history.map((sem, sIdx) => (
            <div
              key={sem.semester}
              className="border border-gray-200 bg-white divide-y divide-gray-100"
            >
              {/* Semester Summary Header */}
              <div className="p-5 md:px-6 md:py-4 bg-gray-50/60 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                      0{sIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-gray-900 tracking-tight">
                      {sem.semester}
                    </h4>
                    <span className="text-xs font-mono text-gray-500 font-sans">
                      • {sem.year}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono">
                  <div>
                    <span className="text-gray-400 uppercase text-[10px] block">
                      SEMESTER GPA
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {sem.gpa.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-[10px] block">
                      AVG SCORE
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {sem.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 uppercase text-[10px] block">
                      CREDITS
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {sem.creditsEarned} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Records List */}
              <div className="divide-y divide-gray-100">
                {sem.modules.map((mod) => (
                  <div
                    key={mod.code}
                    className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-mono font-bold text-gray-400 shrink-0">
                        {mod.code}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {mod.name}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {mod.credits} Academic Credits • GP Value:{' '}
                          {mod.gradePoint.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-gray-900">
                          {mod.score}%
                        </span>
                      </div>
                      <div className="w-10 text-center">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                            mod.score >= 70
                              ? 'bg-primary-light text-primary border-primary/30'
                              : mod.score >= 55
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : mod.score >= 40
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : mod.score >= 28
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {mod.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
