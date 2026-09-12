import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SeatCanvas } from '@/components/seat-plan/seat-canvas';
import { classApi, floorPlanApi, DUMMY_STUDENTS } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { ClassData, FloorPlan } from '@/lib/types';

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassData | null>(null);
  const [plan, setPlan] = useState<FloorPlan | null>(null);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    classApi
      .get(id)
      .then(async (r) => {
        setCls(r.data);
        const [pRes, allRes] = await Promise.all([
          floorPlanApi.get(r.data.floorPlanId),
          classApi.list(),
        ]);
        setPlan(pRes.data);
        setAllClasses(allRes.data);
        setLoading(false);
      })
      .catch(() => navigate(`${basePath}/classes`));
  }, [id, navigate, basePath]);

  // Global taken emails — students assigned in ANY class
  const globalTakenEmails = useMemo(() => {
    const emails = new Map<string, string>(); // email -> className
    allClasses.forEach((c) => {
      c.assignments.forEach((a) => {
        if (!emails.has(a.studentEmail)) {
          emails.set(a.studentEmail, c.name);
        }
      });
    });
    return emails;
  }, [allClasses]);

  const handleExport = useCallback(() => {
    if (!plan) return;
    const seats = plan.seats;
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
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, contentW, contentH);

    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    ctx.fillText(cls?.name || '', padding, padding);

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
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('• FRONT / BLACKBOARD', borderX + borderW / 2, borderY + 16);
    ctx.textAlign = 'right';
    ctx.fillText('DOOR', borderX + borderW - 24, borderY + 16);
    ctx.textAlign = 'start';

    if (seats.length === 0) {
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.fillText(
        'No seats in this plan',
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
      a.download = `seat-plan-${cls?.name || 'class'}.png`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [cls, plan]);

  if (loading || !cls || !plan) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(`${basePath}/classes`)}
        className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-3 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Classes
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cls.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cls.assignments.length} / {plan.seats.length} seats assigned
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStudentList(!showStudentList)}
          >
            <Users size={16} className="mr-2" />
            {showStudentList ? 'Hide' : 'Show'} Students
          </Button>
          <Button onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export PNG
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              {plan.name}
            </h2>
            <div className="relative w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search student to highlight seat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={planRef}>
            <SeatCanvas
              seats={plan.seats}
              onChange={() => {}}
              assignments={cls.assignments}
              highlightStudent={searchQuery}
              readonly
            />
          </div>
        </CardContent>
      </Card>

      {cls.assignments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              Assigned Students
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {cls.assignments
                .sort((a, b) => a.seatIndex - b.seatIndex)
                .map((a) => {
                  const seat = plan.seats[a.seatIndex];
                  return (
                    <div
                      key={a.seatIndex}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xs font-bold text-primary">
                        {seat?.label}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
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

      {showStudentList && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                All Students
              </h2>
              <span className="text-sm text-gray-500">
                {DUMMY_STUDENTS.length - globalTakenEmails.size} available /{' '}
                {DUMMY_STUDENTS.length} total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
              {DUMMY_STUDENTS.sort((a, b) => a.name.localeCompare(b.name)).map(
                (student) => {
                  const isInThisClass = cls.assignments.some(
                    (a) => a.studentEmail === student.email,
                  );
                  const assignedClassName = globalTakenEmails.get(
                    student.email,
                  );
                  const isInOtherClass = !!assignedClassName && !isInThisClass;
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 px-4 py-3 text-sm ${
                        isInThisClass
                          ? 'bg-primary-light'
                          : isInOtherClass
                            ? 'bg-yellow-50'
                            : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.email}
                        </div>
                      </div>
                      {isInThisClass ? (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white shrink-0">
                          This Class
                        </span>
                      ) : isInOtherClass ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 shrink-0">
                          {assignedClassName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 shrink-0">
                          Available
                        </span>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
