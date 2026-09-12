import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  Users,
  GraduationCap,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SeatCanvas } from '@/components/seat-plan/seat-canvas';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import { studentApi } from '@/lib/api/students';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { ClassData, FloorPlan } from '@/lib/types';

interface StudentListItem {
  id: string;
  name: string;
  email: string;
}

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassData | null>(null);
  const [plan, setPlan] = useState<FloorPlan | null>(null);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [allStudents, setAllStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);

    classApi
      .get(id)
      .then(async (r) => {
        const classData = r.data;
        setCls(classData);

        // Fetch floor plan, other classes, and students concurrently with safe fallback handlers
        const [planRes, classListRes, studentListRes] =
          await Promise.allSettled([
            classData.floorPlanId
              ? floorPlanApi.get(classData.floorPlanId)
              : Promise.reject(new Error('No floor plan ID')),
            classApi.list(),
            studentApi.list({ limit: 500 }),
          ]);

        if (planRes.status === 'fulfilled' && planRes.value?.data) {
          setPlan(planRes.value.data);
        } else {
          // Fallback minimal floor plan if not found or detached
          setPlan({
            id: classData.floorPlanId || 'default',
            name: 'Classroom Floor Plan',
            seats: [],
            createdBy: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (classListRes.status === 'fulfilled' && classListRes.value?.data) {
          setAllClasses(classListRes.value.data);
        }

        if (
          studentListRes.status === 'fulfilled' &&
          studentListRes.value?.data
        ) {
          const fetched =
            studentListRes.value.data?.data || studentListRes.value.data || [];
          setAllStudents(Array.isArray(fetched) ? fetched : []);
        } else {
          // If student list endpoint is restricted (e.g. for RTE role), synthesize from assignments
          const syntheticStudents: StudentListItem[] =
            classData.assignments.map((a, index) => ({
              id: `assigned-${index}`,
              name: a.studentName,
              email: a.studentEmail,
            }));
          setAllStudents(syntheticStudents);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load class:', err);
        setLoadError(
          'Unable to load the requested class details. It may have been removed or you do not have permission to view it.',
        );
        setLoading(false);
      });
  }, [id]);

  // Global taken emails — students assigned in ANY class
  const globalTakenEmails = useMemo(() => {
    const emails = new Map<string, string>(); // email -> className
    allClasses.forEach((c) => {
      (c.assignments || []).forEach((a) => {
        if (!emails.has(a.studentEmail)) {
          emails.set(a.studentEmail, c.name);
        }
      });
    });
    return emails;
  }, [allClasses]);

  const handleExport = useCallback(() => {
    if (!plan) return;
    const seats = plan.seats || [];
    const assignments = cls?.assignments || [];
    const seatW = 80;
    const seatH = 80;
    const padding = 40;
    const titleH = 48;
    const titleGap = 24;
    const borderPad = 24;
    const canvasMinW = 700;
    const canvasMinH = 500;
    const scale = 2;

    const seatsW =
      seats.length > 0
        ? Math.max(...seats.map((s) => s.x)) + seatW + borderPad * 2
        : canvasMinW - padding * 2;
    const seatsH =
      seats.length > 0
        ? Math.max(...seats.map((s) => s.y)) + seatH + borderPad * 2
        : canvasMinH - padding * 2 - titleH - titleGap;

    const contentW = Math.max(seatsW + padding * 2, canvasMinW);
    const contentH = Math.max(
      seatsH + padding * 2 + titleH + titleGap,
      canvasMinH,
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(contentW) * scale;
    canvas.height = Math.ceil(contentH) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, contentW, contentH);

    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    ctx.fillText(cls?.name || 'Class Seating Chart', padding, padding);

    const borderX = padding;
    const borderY = padding + titleH + titleGap;
    const borderW = contentW - padding * 2;
    const borderH = contentH - borderY - padding;

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(borderX, borderY, borderW, borderH, 16);
    ctx.stroke();
    ctx.setLineDash([]);

    // Front / Blackboard & Door markers
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('FRONT / BLACKBOARD', borderX + borderW / 2, borderY + 16);
    ctx.textAlign = 'right';
    ctx.fillText('DOOR', borderX + borderW - 24, borderY + borderH - 14);
    ctx.textAlign = 'start';

    if (seats.length === 0) {
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No seats in this floor plan',
        borderX + borderW / 2,
        borderY + borderH / 2 - 7,
      );
      ctx.textAlign = 'start';
    }

    seats.forEach((seat, i) => {
      const x = borderX + seat.x;
      const y = borderY + seat.y;
      const assignment = assignments.find((a) => a.seatIndex === i);

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x, y, seatW, seatH, 16);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        seat.label,
        x + seatW / 2,
        y + (assignment ? 30 : seatH / 2),
      );

      if (assignment) {
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(assignment.studentName, x + seatW / 2, y + 52);
      }

      ctx.textAlign = 'start';
      ctx.textBaseline = 'top';
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `seating-plan-${cls?.name || 'class'}.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [cls, plan]);

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-gray-500">
              Loading class seating plan...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError || !cls) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate(`${basePath}/classes`)}
          className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Classes
        </button>

        <Card className="rounded-2xl border-red-200 bg-red-50/40">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-3">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Class Not Found
            </h3>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              {loadError || 'The requested class could not be loaded.'}
            </p>
            <Button
              onClick={() => navigate(`${basePath}/classes`)}
              className="cursor-pointer"
            >
              Return to Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const seats = plan?.seats || [];
  const assignments = cls.assignments || [];
  const assignedCount = assignments.length;
  const totalCapacity = seats.length;
  const fillRate = totalCapacity
    ? Math.round((assignedCount / totalCapacity) * 100)
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`${basePath}/classes`)}
          className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Classes
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary border border-primary/15 shadow-2xs">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
                {cls.name}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gray-400" />
                  {plan?.name || 'Classroom Layout'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  {assignedCount} / {totalCapacity} seats assigned ({fillRate}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={() => setShowStudentList(!showStudentList)}
              className="gap-2 cursor-pointer rounded-xl"
            >
              <Users size={16} />
              {showStudentList ? 'Hide' : 'Show'} Students
            </Button>
            <Button
              onClick={handleExport}
              className="gap-2 shadow-sm cursor-pointer rounded-xl"
            >
              <Download size={16} />
              Export PNG
            </Button>
          </div>
        </div>
      </div>

      {/* Seating Plan Canvas Card */}
      <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-gray-900">
                Interactive Seating Chart — {plan?.name || 'Layout'}
              </h2>
            </div>
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search student to highlight seat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs sm:text-sm rounded-xl border-gray-200 bg-gray-50/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={planRef} className="overflow-x-auto">
            <SeatCanvas
              seats={seats}
              onChange={() => {}}
              assignments={assignments}
              highlightStudent={searchQuery}
              readonly
            />
          </div>
        </CardContent>
      </Card>

      {/* Assigned Students Roster Grid */}
      {assignments.length > 0 && (
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Assigned Students Roster ({assignments.length})
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Sorted by desk order
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {[...assignments]
                .sort((a, b) => a.seatIndex - b.seatIndex)
                .map((a) => {
                  const seat = seats[a.seatIndex];
                  const isMatching =
                    searchQuery.trim() &&
                    (a.studentName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      a.studentEmail
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()));

                  return (
                    <div
                      key={a.seatIndex}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                        isMatching
                          ? 'border-primary ring-2 ring-primary/20 bg-primary-light'
                          : 'border-gray-200/80 bg-gray-50/60 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-900 shadow-2xs">
                        {seat?.label || `S${a.seatIndex + 1}`}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {a.studentName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {a.studentEmail}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Students Roster Drawer / List */}
      {showStudentList && (
        <Card className="rounded-2xl border-gray-200/90 shadow-2xs">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                All Available Students
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                {allStudents.length} total students tracked
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
              {[...allStudents]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((student) => {
                  const isInThisClass = assignments.some(
                    (a) => a.studentEmail === student.email,
                  );
                  const assignedClassName = globalTakenEmails.get(
                    student.email,
                  );
                  const isInOtherClass = !!assignedClassName && !isInThisClass;
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        isInThisClass
                          ? 'bg-primary-light/60'
                          : isInOtherClass
                            ? 'bg-amber-50/50'
                            : 'hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.email}
                        </div>
                      </div>
                      {isInThisClass ? (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white shrink-0">
                          This Class
                        </span>
                      ) : isInOtherClass ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 shrink-0">
                          {assignedClassName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 shrink-0">
                          Available
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
