import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowUpRight,
  TrendingUp,
  BookOpen,
  Armchair,
  Award,
  Clock,
  CalendarDays,
  User,
  Filter,
} from 'lucide-react';
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
import { selectCurrentUser } from '@/redux/userSlice';
import { studentApi } from '@/lib/api/students';
import { moduleApi } from '@/lib/api/modules';
import { resultApi } from '@/lib/api/results';
import { facultyApi } from '@/lib/api/faculties';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import type { ClassData, FloorPlan } from '@/lib/types';

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

export function formatStudentDisplayName(raw?: string): string {
  if (!raw) return 'Alex Mercer';
  if (raw.includes(' ') && !raw.includes('@') && raw !== raw.toUpperCase()) {
    return raw;
  }
  const clean = raw.includes('@') ? raw.split('@')[0] : raw;
  return clean
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const DEMO_SEMESTER_HISTORY: SemesterHistory[] = [
  {
    semester: 'Semester 1',
    year: 'Year 1 (Autumn 2024)',
    gpa: 3.75,
    averageScore: 78.4,
    creditsEarned: 60,
    totalCredits: 60,
    standing: 'First Class Track',
    modules: [
      {
        code: 'CS4001',
        name: 'Web Development & UI/UX',
        credits: 15,
        score: 82.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS4002',
        name: 'Relational Database Systems',
        credits: 15,
        score: 76.5,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS4003',
        name: 'Algorithms & Data Structures',
        credits: 15,
        score: 74.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS4004',
        name: 'Discrete Mathematics & Logic',
        credits: 15,
        score: 81.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
    ],
  },
  {
    semester: 'Semester 2',
    year: 'Year 1 (Spring 2025)',
    gpa: 3.85,
    averageScore: 81.6,
    creditsEarned: 60,
    totalCredits: 60,
    standing: 'First Class Track',
    modules: [
      {
        code: 'CS5001',
        name: 'Advanced Database Architecture',
        credits: 15,
        score: 84.5,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS5002',
        name: 'Cloud Infrastructure & Networks',
        credits: 15,
        score: 79.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS5003',
        name: 'Object-Oriented Software Engineering',
        credits: 15,
        score: 85.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS5004',
        name: 'Applied Machine Learning',
        credits: 15,
        score: 78.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
    ],
  },
  {
    semester: 'Semester 3',
    year: 'Year 2 (Autumn 2025)',
    gpa: 3.9,
    averageScore: 83.1,
    creditsEarned: 60,
    totalCredits: 60,
    standing: 'First Class Honours',
    modules: [
      {
        code: 'CS6001',
        name: 'Artificial Intelligence & Neural Systems',
        credits: 15,
        score: 86.5,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS6002',
        name: 'Distributed Systems & Microservices',
        credits: 15,
        score: 84.0,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS6003',
        name: 'DevOps & Continuous Integration',
        credits: 15,
        score: 79.5,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
      {
        code: 'CS6004',
        name: 'Capstone System Architecture',
        credits: 15,
        score: 82.5,
        grade: 'A',
        gradePoint: 4.0,
        status: 'PASS',
      },
    ],
  },
];

export default function StudentOverview() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [studentName, setStudentName] = useState('Alex Mercer');
  const [facultyName, setFacultyName] = useState(
    'Department of Computing & IT',
  );
  const [modulesCount, setModulesCount] = useState('04');
  const [academicScore, setAcademicScore] = useState('83.1%');
  const [assignedSeat, setAssignedSeat] = useState('Desk #A4');
  const [loading, setLoading] = useState(false);

  // Analytics filter state
  const [analyticsHistory] = useState<SemesterHistory[]>(DEMO_SEMESTER_HISTORY);
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');

  useEffect(() => {
    async function loadStudentMetrics() {
      try {
        const studentEmail = user?.email?.toLowerCase() || '';

        // Derive friendly display name
        const rawName = user?.email || 'Alex Mercer';
        setStudentName(formatStudentDisplayName(rawName));

        // 1. Fetch student record by email
        let studentFacultyId = user?.facultyId || null;

        try {
          const studentRes = await studentApi.list({
            search: studentEmail,
            limit: 1,
          });
          const students = studentRes.data?.data || [];
          const matched = students.find(
            (s) => s.email.toLowerCase() === studentEmail,
          );
          if (matched) {
            setStudentName(formatStudentDisplayName(matched.name));
            studentFacultyId = matched.facultyId;
          }
        } catch {
          // Keep derived name
        }

        // 2. Fetch faculty name
        if (studentFacultyId) {
          try {
            const facRes = await facultyApi.list({ limit: 50 });
            const facs = facRes.data?.data || [];
            const fac = facs.find((f) => f.id === studentFacultyId);
            if (fac) setFacultyName(fac.name);
          } catch {
            // Keep default
          }
        }

        // 3. Fetch modules
        try {
          const modulesRes = await moduleApi.list({ limit: 50 });
          const modules = modulesRes.data?.data || [];
          if (modules.length > 0) {
            setModulesCount(modules.length.toString().padStart(2, '0'));
          } else {
            setModulesCount('04');
          }
        } catch {
          setModulesCount('04');
        }

        // 4. Fetch results
        try {
          const resultsRes = await resultApi.list({
            published: 'true',
            limit: 5,
          });
          const results = resultsRes.data?.data || [];
          const published = results.filter((r) => r.published);
          const bestResult = published.length > 0 ? published[0] : results[0];

          if (bestResult?.items && bestResult.items.length > 0) {
            const avg =
              bestResult.items.reduce((acc, it) => acc + it.score, 0) /
              bestResult.items.length;
            setAcademicScore(`${avg.toFixed(1)}%`);
          } else {
            setAcademicScore('83.1%');
          }
        } catch {
          setAcademicScore('83.1%');
        }

        // 5. Fetch seat assignment
        try {
          const [classesRes, floorPlansRes] = await Promise.all([
            classApi.list(),
            floorPlanApi.list(),
          ]);

          const classes: ClassData[] = classesRes.data || [];
          const floorPlans: FloorPlan[] = floorPlansRes.data || [];
          const floorPlanMap = new Map(floorPlans.map((fp) => [fp.id, fp]));

          for (const cls of classes) {
            const fp = floorPlanMap.get(cls.floorPlanId);
            const assignment = cls.assignments?.find(
              (a) =>
                a.studentEmail?.toLowerCase() === studentEmail ||
                (a.studentName &&
                  user?.email &&
                  user.email
                    .toLowerCase()
                    .includes(a.studentName.toLowerCase().replace(/\s+/g, ''))),
            );

            if (assignment) {
              const label =
                fp?.seats?.[assignment.seatIndex]?.label ||
                `Desk #${assignment.seatIndex + 1}`;
              setAssignedSeat(label);
              break;
            }
          }
        } catch {
          // Keep default
        }
      } catch (err) {
        console.error('Failed to load student overview metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentMetrics();
  }, [user?.email, user?.facultyId]);

  // Get current greeting based on local time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Chart datasets calculations
  const allModulesList = analyticsHistory.flatMap((s) => s.modules);

  const filteredModulesForChart =
    selectedSemester === 'ALL'
      ? allModulesList
      : (analyticsHistory.find((s) => s.semester === selectedSemester)
          ?.modules ?? allModulesList);

  const lineChartData = {
    labels: filteredModulesForChart.map((m) => m.code),
    datasets: [
      {
        label: 'Achieved Score (%)',
        data: filteredModulesForChart.map((m) => m.score),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Distinction Benchmark (70%)',
        data: filteredModulesForChart.map(() => 70),
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            size: 11,
          },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          family:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          size: 11,
        },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          afterTitle: (items: { dataIndex: number }[]) => {
            const idx = items[0].dataIndex;
            return filteredModulesForChart[idx]?.name || '';
          },
          label: (context: {
            parsed: { y: number | null };
            dataIndex: number;
          }) =>
            ` Score: ${context.parsed.y ?? 0}% • Grade: ${filteredModulesForChart[context.dataIndex]?.grade}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: {
            family:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            size: 11,
          },
          color: '#64748b',
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: {
            family:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            size: 11,
          },
          color: '#64748b',
          callback: (val: string | number) => `${val}%`,
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
      },
    },
  };

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
        data: [
          gradeCounts.A,
          gradeCounts.B,
          gradeCounts.C,
          gradeCounts.D,
          gradeCounts.F,
        ],
        backgroundColor: [
          '#16a34a',
          '#0284c7',
          '#8b5cf6',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 2.5,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: {
          family:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          size: 12,
        },
        bodyFont: {
          family:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
          size: 11,
        },
        padding: 10,
        cornerRadius: 10,
      },
    },
    cutout: '74%',
  };

  const stats = [
    {
      index: '01',
      label: 'ENROLLED MODULES',
      value: loading ? '—' : modulesCount,
      description: 'Current semester registration',
      icon: BookOpen,
      iconColor: 'text-[#16A34A]',
      iconBg: 'ios26-icon-pod',
      valueColor: 'text-gray-900',
    },
    {
      index: '02',
      label: 'ACADEMIC AVERAGE',
      value: loading ? '—' : academicScore,
      description: 'Semester grade performance',
      icon: TrendingUp,
      iconColor: 'text-[#16A34A]',
      iconBg: 'ios26-icon-pod',
      valueColor: 'text-[#16A34A]',
    },
    {
      index: '03',
      label: 'ASSIGNED EXAM SEAT',
      value: loading ? '—' : assignedSeat,
      description: facultyName,
      icon: Armchair,
      iconColor: 'text-[#16A34A]',
      iconBg: 'ios26-icon-pod',
      valueColor: 'text-gray-900',
    },
  ];

  const directoryItems = [
    {
      index: '01',
      title: 'My Results',
      description:
        'Official examination evaluations, module grades, GPA calculation, and semester transcript.',
      to: '/dashboard/student/results',
      icon: Award,
    },
    {
      index: '02',
      title: 'Performance Analytics',
      description:
        'Multi-semester GPA progression curves, honours benchmark comparisons, and credit tracker.',
      to: '/dashboard/student/analytics',
      icon: TrendingUp,
    },
    {
      index: '03',
      title: 'My Modules',
      description:
        'Curriculum courses, syllabus outlines, credit weightings, and faculty module leaders.',
      to: '/dashboard/student/modules',
      icon: BookOpen,
    },
    {
      index: '04',
      title: "Today's Examination",
      description:
        'Live session schedule, examination hall room number, allocated desk, and hall guidelines.',
      to: '/dashboard/student/examination/today',
      icon: Clock,
    },
    {
      index: '05',
      title: 'Upcoming Examinations',
      description:
        'Semester routine schedules, examination timetable, dates, and assessment guidelines.',
      to: '/dashboard/student/examination/upcoming',
      icon: CalendarDays,
    },
    {
      index: '06',
      title: 'Examination Seating Plan',
      description:
        'Classroom floor plan layouts, student seat assignments, and room allocation maps.',
      to: '/dashboard/student/examination/seating',
      icon: Armchair,
    },
    {
      index: '07',
      title: 'Student Profile & Identity',
      description:
        'Official academic identity, verified student credentials, and profile photo management.',
      to: '/dashboard/student/profile',
      icon: User,
    },
  ];

  return (
    <div
      className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-16"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* 1. Main Header */}
      <header className="border-b border-gray-200/60 pb-5 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          {greeting}, <span className="text-[#16A34A]">{studentName}</span>
        </h1>
        <p className="text-sm text-gray-500 font-normal">
          Welcome to the Student portal. Access your enrolled modules,
          examination seating, and academic grades.
        </p>
      </header>

      {/* 2. Academic Overview Grid */}
      <section className="space-y-3">
        <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          01 / ACADEMIC OVERVIEW
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.index}
                className="ios26-card p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium tracking-wider text-gray-400 uppercase">
                    {stat.label}
                  </span>
                  <div
                    className={`p-2.5 rounded-2xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}
                  >
                    <Icon size={16} />
                  </div>
                </div>

                <div>
                  <p
                    className={`text-3xl sm:text-4xl font-bold tracking-tight tabular-nums leading-none ${stat.valueColor}`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-normal truncate font-sans">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Integrated Performance Analytics Chart Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono font-semibold tracking-wider text-gray-400 uppercase">
            02 / PERFORMANCE ANALYTICS & TRENDS
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/student/analytics')}
            className="text-xs font-semibold text-[#16A34A] hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            Full Analytics <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module Score Line Chart (2 Cols) */}
          <div className="lg:col-span-2 ios26-card p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.05]">
              <div>
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Module Scores vs Distinction
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-sans">
                  A 70–100 • B 55–69 • C 40–54 • D 28–39 • F 0–27
                </p>
              </div>

              {/* Semester Filter Selector */}
              <div className="flex items-center gap-1.5 ios26-glass-pill rounded-xl p-1 text-xs">
                <Filter size={13} className="text-gray-400 ml-1.5" />
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-2 py-0.5"
                >
                  <option value="ALL">All Modules</option>
                  {analyticsHistory.map((s) => (
                    <option key={s.semester} value={s.semester}>
                      {s.semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading performance trends...
                </div>
              ) : allModulesList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No graded modules recorded yet
                </div>
              ) : (
                <Line data={lineChartData} options={lineChartOptions} />
              )}
            </div>
          </div>

          {/* Grade Distribution Breakdown (1 Col) */}
          <div className="ios26-card p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="pb-4 border-b border-black/[0.05]">
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                Grade Distribution
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 font-sans">
                Breakdown of {allModulesList.length} total completed
                assessments.
              </p>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
                  {gradeCounts.A}
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mt-1 font-mono">
                  Grade A
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-black/[0.05] pt-4 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
                  <span className="font-medium">A (70–100)</span>
                </span>
                <span className="font-bold tabular-nums text-gray-900">
                  {gradeCounts.A}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                  <span className="font-medium">B (55–69)</span>
                </span>
                <span className="font-bold tabular-nums text-gray-900">
                  {gradeCounts.B}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                  <span className="font-medium">C (40–54)</span>
                </span>
                <span className="font-bold tabular-nums text-gray-900">
                  {gradeCounts.C}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="font-medium">D (28–39)</span>
                </span>
                <span className="font-bold tabular-nums text-gray-900">
                  {gradeCounts.D}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="font-medium">F (0–27)</span>
                </span>
                <span className="font-bold tabular-nums text-gray-900">
                  {gradeCounts.F}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Access & Services Directory */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono font-semibold tracking-wider text-gray-400 uppercase">
          03 / SERVICES & DIRECTORY
        </div>

        <div className="ios26-card divide-y divide-black/[0.04] overflow-hidden">
          {directoryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.index}
                onClick={() => navigate(item.to)}
                className="group p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/40 transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-start md:items-center gap-4 min-w-0">
                  <div className="p-2.5 rounded-2xl ios26-icon-pod text-[#16A34A] transition-colors shrink-0 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#16A34A] transition-colors tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-gray-400 group-hover:text-[#16A34A] shrink-0 self-end md:self-center transition-colors">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
