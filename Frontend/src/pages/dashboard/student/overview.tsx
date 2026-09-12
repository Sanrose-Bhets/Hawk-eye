import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowUpRight } from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { moduleApi } from '@/lib/api/modules';
import { resultApi } from '@/lib/api/results';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import type { ClassData, FloorPlan } from '@/lib/types';

export default function StudentOverview() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [modulesCount, setModulesCount] = useState('04');
  const [academicScore, setAcademicScore] = useState('84.2%');
  const [assignedSeat, setAssignedSeat] = useState('Desk #14');

  useEffect(() => {
    async function loadStudentMetrics() {
      try {
        const studentEmail = user?.email?.toLowerCase() || '';

        const [modulesRes, resultsRes, classesRes, floorPlansRes] =
          await Promise.allSettled([
            moduleApi.list({ limit: 10 }),
            resultApi.list({ search: studentEmail, limit: 1 }),
            classApi.list(),
            floorPlanApi.list(),
          ]);

        if (modulesRes.status === 'fulfilled' && modulesRes.value.data?.data) {
          const total = modulesRes.value.data.data.length;
          if (total > 0) setModulesCount(total.toString().padStart(2, '0'));
        }

        if (
          resultsRes.status === 'fulfilled' &&
          resultsRes.value.data?.data &&
          resultsRes.value.data.data.length > 0
        ) {
          const resItem = resultsRes.value.data.data[0];
          if (resItem.items && resItem.items.length > 0) {
            const avg =
              resItem.items.reduce((acc, it) => acc + it.score, 0) /
              resItem.items.length;
            setAcademicScore(`${avg.toFixed(1)}%`);
          }
        }

        if (
          classesRes.status === 'fulfilled' &&
          floorPlansRes.status === 'fulfilled'
        ) {
          const classes: ClassData[] = classesRes.value.data || [];
          const floorPlans: FloorPlan[] = floorPlansRes.value.data || [];
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
        }
      } catch (err) {
        console.error('Failed to load student overview metrics:', err);
      }
    }

    if (user?.email) {
      loadStudentMetrics();
    }
  }, [user?.email]);

  const studentName = user?.email
    ? user.email.split('@')[0].toUpperCase()
    : 'STUDENT';

  // Get current greeting based on local time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      index: '01',
      label: 'ENROLLED MODULES',
      value: modulesCount,
      description: 'Current semester registration',
    },
    {
      index: '02',
      label: 'ACADEMIC AVERAGE',
      value: academicScore,
      description: 'Semester grade performance',
      highlight: true,
    },
    {
      index: '03',
      label: 'ASSIGNED EXAM SEAT',
      value: assignedSeat,
      description: 'Hall A • Main Exam Room',
    },
  ];

  const directoryItems = [
    {
      index: '01',
      title: 'My Results',
      description:
        'Official examination evaluations, module grades, GPA calculation, and semester transcript.',
      to: '/dashboard/student/results',
    },
    {
      index: '02',
      title: 'My Modules',
      description:
        'Curriculum courses, syllabus outlines, credit weightings, and faculty module leaders.',
      to: '/dashboard/student/modules',
    },
    {
      index: '03',
      title: "Today's Examination",
      description:
        'Live session schedule, examination hall room number, allocated desk, and hall guidelines.',
      to: '/dashboard/student/examination/today',
    },
    {
      index: '04',
      title: 'Upcoming Examinations',
      description:
        'Semester routine schedules, examination timetable, dates, and assessment guidelines.',
      to: '/dashboard/student/examination/upcoming',
    },
    {
      index: '05',
      title: 'Examination Seating Plan',
      description:
        'Classroom floor plan layouts, student seat assignments, and room allocation maps.',
      to: '/dashboard/student/examination/seating',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* 1. Main Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          {greeting}, {studentName}.
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Welcome to the Student portal. Access your enrolled modules,
          examination seating, and academic grades.
        </p>
      </header>

      {/* 2. Academic Overview Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          <span>01 / ACADEMIC OVERVIEW</span>
          <span>LIVE METRICS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
          {stats.map((stat) => (
            <div
              key={stat.index}
              className="p-6 flex flex-col justify-between space-y-6 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400">
                  {stat.index} // {stat.label}
                </span>
                {stat.highlight && (
                  <span className="h-1.5 w-1.5 bg-primary inline-block" />
                )}
              </div>

              <div>
                <p className="text-3xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-gray-900 leading-none">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-2 font-sans font-normal">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Quick Access & Services Directory */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400">
          <span>02 / SERVICES & DIRECTORY</span>
          <span>NAVIGATION INDEX</span>
        </div>

        <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
          {directoryItems.map((item) => (
            <div
              key={item.index}
              onClick={() => navigate(item.to)}
              className="group p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start md:items-center gap-4 md:gap-6 min-w-0">
                <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-primary transition-colors shrink-0 pt-0.5 md:pt-0">
                  {item.index}
                </span>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-sans font-normal">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-gray-400 group-hover:text-primary shrink-0 self-end md:self-center transition-colors">
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">
                  Access
                </span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
