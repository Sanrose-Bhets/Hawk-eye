import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, MapPin, Armchair, AlertTriangle, User } from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import { moduleApi } from '@/lib/api/modules';
import { examRoutineApi } from '@/lib/api/exam-routines';
import type { ClassData, FloorPlan, Module, ExamRoutine } from '@/lib/types';

function isToday(dateStr: string): boolean {
  const epochMs =
    typeof (dateStr as unknown as { epochMilliseconds?: number })
      .epochMilliseconds === 'number'
      ? (dateStr as unknown as { epochMilliseconds: number }).epochMilliseconds
      : new Date(dateStr).getTime();
  const d = new Date(epochMs);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function formatTimeRange(startTime: string, endTime: string): string {
  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

export default function TodaysExamPage() {
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [assignedExam, setAssignedExam] = useState<{
    moduleName: string;
    moduleCode: string;
    moduleLeader: string;
    className: string;
    floorPlanName: string;
    seatLabel: string;
    seatIndex: number;
    time: string;
    duration: string;
  } | null>(null);

  useEffect(() => {
    async function loadTodayExam() {
      try {
        setLoading(true);

        // Fetch exam routines, modules, classes, and floor plans
        const [routinesRes, modulesRes, classesRes, floorPlansRes] =
          await Promise.all([
            examRoutineApi.studentList(),
            moduleApi.list({ limit: 50 }),
            classApi.list(),
            floorPlanApi.list(),
          ]);

        const routines: ExamRoutine[] = routinesRes.data || [];
        const modules: Module[] = modulesRes.data?.data || [];
        const classes: ClassData[] = classesRes.data || [];
        const floorPlans: FloorPlan[] = floorPlansRes.data || [];

        const moduleMap = new Map(modules.map((m) => [m.id, m]));
        const floorPlanMap = new Map(floorPlans.map((fp) => [fp.id, fp]));

        // Find today's exam routine
        const todayRoutine = routines.find((r) => isToday(r.date));

        if (!todayRoutine) {
          setAssignedExam(null);
          return;
        }

        // Resolve module info
        const mod = moduleMap.get(todayRoutine.moduleId);

        // Find student's seat assignment
        const studentEmail = user?.email?.toLowerCase() || '';
        let seatLabel = 'Not assigned';
        let seatIndex = 0;
        let className = '—';
        let floorPlanName = '—';

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
            seatLabel =
              fp?.seats?.[assignment.seatIndex]?.label ||
              `Seat #${assignment.seatIndex + 1}`;
            seatIndex = assignment.seatIndex;
            className = cls.name;
            floorPlanName = fp?.name || 'Examination Hall';
            break;
          }
        }

        setAssignedExam({
          moduleName: mod?.name || 'Unknown Module',
          moduleCode: mod?.code || '—',
          moduleLeader: mod?.moduleLeader || '—',
          className,
          floorPlanName,
          seatLabel,
          seatIndex,
          time: formatTimeRange(todayRoutine.startTime, todayRoutine.endTime),
          duration: todayRoutine.duration,
        });
      } catch (err) {
        console.error('Failed to load today exam:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.email) {
      loadTodayExam();
    }
  }, [user?.email]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          Today's Examination
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Real-time schedule, room allocations, and exam instructions for today.
        </p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 font-sans">
          Checking today's examination database...
        </div>
      ) : assignedExam ? (
        <div className="space-y-8">
          {/* Active Exam Block */}
          <div className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
                <span className="h-2 w-2 bg-primary inline-block" />
                <span>EXAMINATION SESSION CONFIRMED</span>
              </div>
              <span className="text-xs font-mono text-gray-500">
                DURATION: {assignedExam.duration}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-gray-500">
                    {assignedExam.moduleCode}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                    {assignedExam.moduleName}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-600 font-sans">
                    <User size={14} className="text-gray-400" />
                    <span>MODULE LEADER: {assignedExam.moduleLeader}</span>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 bg-gray-50 min-w-56">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                    <Clock size={14} className="text-primary" />
                    <span>SESSION TIMING</span>
                  </div>
                  <p className="text-xl font-bold font-mono text-gray-900 mt-1">
                    {assignedExam.time}
                  </p>
                </div>
              </div>

              {/* 3-Col Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    <Armchair size={14} className="text-primary" />
                    <span>ASSIGNED SEAT</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-primary">
                    {assignedExam.seatLabel}
                  </p>
                  <p className="text-xs font-mono text-gray-400 font-sans">
                    DESK INDEX #{assignedExam.seatIndex + 1}
                  </p>
                </div>

                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    <MapPin size={14} className="text-gray-600" />
                    <span>EXAMINATION VENUE</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-gray-900 truncate uppercase">
                    {assignedExam.floorPlanName}
                  </p>
                  <p className="text-xs font-mono text-gray-400 font-sans">
                    CLASS SECTION: {assignedExam.className}
                  </p>
                </div>

                <div className="p-6 space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                    ELIGIBILITY STATUS
                  </div>
                  <p className="text-xl font-bold tracking-tight text-primary uppercase">
                    CLEARED & VERIFIED
                  </p>
                  <p className="text-xs font-mono text-gray-400 font-sans">
                    ADMIT CARD ACTIVE
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="border border-gray-200 bg-white p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-900">
              <AlertTriangle size={15} className="text-primary" />
              <span>EXAMINATION PROTOCOL & RULES</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 font-normal leading-relaxed border-t border-gray-100 pt-3 font-sans">
              <p>
                1. Candidates must arrive at the examination hall at least 15
                minutes prior to the scheduled start time.
              </p>
              <p>
                2. Physical Student ID card is mandatory for desk verification
                and invigilator signature.
              </p>
              <p>
                3. Electronic devices, smartwatches, and unauthorized
                documentation are strictly prohibited inside the hall.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 bg-white p-12 text-center space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            STATUS: NO SESSIONS
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            No Exam Scheduled For Today
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto font-sans">
            You have no examination sessions registered for today. Navigate to
            the <strong>Upcoming Exam</strong> section to inspect the full
            semester routine.
          </p>
        </div>
      )}
    </div>
  );
}
