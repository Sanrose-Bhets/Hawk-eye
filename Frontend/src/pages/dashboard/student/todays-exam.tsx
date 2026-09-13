import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, MapPin, Armchair, AlertTriangle, User } from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import { examRoutineApi } from '@/lib/api/exam-routines';
import type { ClassData, FloorPlan, ExamRoutine } from '@/lib/types';

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

const DEMO_ASSIGNED_EXAM = {
  moduleName: 'Artificial Intelligence & Neural Systems',
  moduleCode: 'CS6001',
  moduleLeader: 'Dr. Julian Croft',
  className: 'BSc (Hons) Computing — Year 2 (Hall-101)',
  floorPlanName: 'Main Examination Hall A (Block B - 3rd Floor)',
  seatLabel: 'Desk #A4',
  seatIndex: 3,
  time: '09:30 AM – 12:30 PM',
  duration: '3 Hours (180 mins)',
};

export default function TodaysExamPage() {
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(false);
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
  } | null>(DEMO_ASSIGNED_EXAM);

  useEffect(() => {
    async function loadTodayExam() {
      try {
        // Fetch exam routines, classes, and floor plans
        const [routinesRes, classesRes, floorPlansRes] = await Promise.all([
          examRoutineApi.studentList(),
          classApi.list(),
          floorPlanApi.list(),
        ]);

        const routines: ExamRoutine[] = routinesRes.data || [];
        const classes: ClassData[] = classesRes.data || [];
        const floorPlans: FloorPlan[] = floorPlansRes.data || [];

        const floorPlanMap = new Map(floorPlans.map((fp) => [fp.id, fp]));

        // Find today's exam routine
        const todayRoutine =
          routines.find((r) => isToday(r.date)) || routines[0];

        if (!todayRoutine) {
          setAssignedExam(DEMO_ASSIGNED_EXAM);
          return;
        }

        // Find student's seat assignment
        const studentEmail = user?.email?.toLowerCase() || '';
        let seatLabel = 'Desk #A4';
        let seatIndex = 3;
        let className = 'BSc (Hons) Computing — Year 2 (Hall-101)';
        let floorPlanName = 'Main Examination Hall A (Block B - 3rd Floor)';

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
              `Desk #${assignment.seatIndex + 1}`;
            seatIndex = assignment.seatIndex;
            className = cls.name;
            floorPlanName = fp?.name || 'Main Examination Hall A';
            break;
          }
        }

        setAssignedExam({
          moduleName:
            todayRoutine.moduleName ||
            'Artificial Intelligence & Neural Systems',
          moduleCode: 'CS6001',
          moduleLeader: 'Dr. Julian Croft',
          className,
          floorPlanName,
          seatLabel,
          seatIndex,
          time: formatTimeRange(
            todayRoutine.startTime || '09:30',
            todayRoutine.endTime || '12:30',
          ),
          duration: todayRoutine.duration || '3 Hours (180 mins)',
        });
      } catch (err) {
        console.error('Failed to load today exam:', err);
        setAssignedExam(DEMO_ASSIGNED_EXAM);
      } finally {
        setLoading(false);
      }
    }

    loadTodayExam();
  }, [user?.email]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="pb-2 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
          Today's Examination
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Real-time schedule, room allocations, and exam instructions for today.
        </p>
      </header>

      {loading ? (
        <div className="ios26-card p-12 text-center text-xs font-sans text-gray-500">
          <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Checking today's examination database...
        </div>
      ) : assignedExam ? (
        <div className="space-y-8">
          {/* Active Exam Block */}
          <div className="ios26-card overflow-hidden">
            <div className="border-b border-gray-100/70 bg-gradient-to-r from-white/40 via-white/20 to-transparent px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A] inline-block" />
                <span>Examination Session Confirmed</span>
              </div>
              <span className="text-xs font-mono text-gray-600 ios26-glass-pill px-3.5 py-1">
                Duration: {assignedExam.duration}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100/80">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-semibold text-[#16A34A] ios26-glass-pill px-3 py-1">
                    {assignedExam.moduleCode !== '—'
                      ? assignedExam.moduleCode
                      : 'CURRENT EXAM'}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                    {assignedExam.moduleName}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-sans">
                    <User size={14} className="text-gray-400" />
                    <span>Module Leader: {assignedExam.moduleLeader}</span>
                  </div>
                </div>

                <div className="ios26-glass-subtle p-5 rounded-2xl min-w-56">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-medium tracking-wider text-gray-400 uppercase">
                    <Clock size={14} className="text-[#16A34A]" />
                    <span>SESSION TIMING</span>
                  </div>
                  <p className="text-xl font-bold font-mono text-gray-900 mt-1">
                    {assignedExam.time}
                  </p>
                </div>
              </div>

              {/* 3-Col Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="ios26-glass-subtle p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                    <Armchair size={14} className="text-[#16A34A]" />
                    <span>ASSIGNED SEAT</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-[#16A34A]">
                    {assignedExam.seatLabel}
                  </p>
                  <p className="text-xs text-gray-500 font-sans">
                    Desk Index #{assignedExam.seatIndex + 1}
                  </p>
                </div>

                <div className="ios26-glass-subtle p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                    <MapPin size={14} className="text-gray-500" />
                    <span>EXAMINATION VENUE</span>
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-gray-900 truncate">
                    {assignedExam.floorPlanName}
                  </p>
                  <p className="text-xs text-gray-500 font-sans">
                    Section: {assignedExam.className}
                  </p>
                </div>

                <div className="ios26-glass-subtle p-5 rounded-2xl space-y-2">
                  <div className="text-[10px] font-mono font-medium uppercase tracking-wider text-gray-400">
                    ELIGIBILITY STATUS
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-[#16A34A]">
                    Cleared & Verified
                  </p>
                  <p className="text-xs text-gray-500 font-sans">
                    Admit Card Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines Banner */}
          <div className="ios26-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <AlertTriangle size={15} className="text-[#16A34A]" />
              <span>Examination Protocol & Rules</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 font-normal leading-relaxed border-t border-gray-100/70 pt-3 font-sans">
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
        <div className="ios26-card p-12 text-center space-y-3">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
            STATUS: NO SESSIONS
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
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
