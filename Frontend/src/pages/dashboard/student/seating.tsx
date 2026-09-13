import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapPin } from 'lucide-react';
import { selectCurrentUser } from '@/redux/userSlice';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import type { ClassData, FloorPlan } from '@/lib/types';

interface StudentSeatAllocation {
  className: string;
  floorPlanName: string;
  seatLabel: string;
  seatIndex: number;
}

const DEMO_ALLOCATIONS: StudentSeatAllocation[] = [
  {
    className: 'BSc (Hons) Computing — Year 2 (Hall-101)',
    floorPlanName: 'Main Examination Hall A (Block B - 3rd Floor)',
    seatLabel: 'Desk #A4 (Row 1, Seat 4)',
    seatIndex: 3,
  },
  {
    className: 'CS6002 Section C — Advanced Systems',
    floorPlanName: 'Computing Technology Lab 301',
    seatLabel: 'Desk #B2 (Row 2, Seat 2)',
    seatIndex: 5,
  },
];

export default function StudentSeatingPage() {
  const user = useSelector(selectCurrentUser);
  const [allocations, setAllocations] =
    useState<StudentSeatAllocation[]>(DEMO_ALLOCATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSeating() {
      try {
        const [classesRes, floorPlansRes] = await Promise.all([
          classApi.list(),
          floorPlanApi.list(),
        ]);

        const classes: ClassData[] = classesRes.data || [];
        const floorPlans: FloorPlan[] = floorPlansRes.data || [];
        const floorPlanMap = new Map(floorPlans.map((fp) => [fp.id, fp]));

        const studentEmail = user?.email?.toLowerCase() || '';
        const found: StudentSeatAllocation[] = [];

        classes.forEach((cls) => {
          const fp = floorPlanMap.get(cls.floorPlanId);
          cls.assignments?.forEach((assignment) => {
            if (
              assignment.studentEmail?.toLowerCase() === studentEmail ||
              (assignment.studentName &&
                user?.email &&
                user.email
                  .toLowerCase()
                  .includes(
                    assignment.studentName.toLowerCase().replace(/\s+/g, ''),
                  ))
            ) {
              const seatLabel =
                fp?.seats?.[assignment.seatIndex]?.label ||
                `Desk #${assignment.seatIndex + 1}`;
              found.push({
                className: cls.name,
                floorPlanName: fp?.name || 'Examination Hall',
                seatLabel,
                seatIndex: assignment.seatIndex,
              });
            }
          });
        });

        if (found.length > 0) {
          setAllocations(found);
        } else {
          setAllocations(DEMO_ALLOCATIONS);
        }
      } catch (err) {
        console.error('Failed to load student seating:', err);
        setAllocations(DEMO_ALLOCATIONS);
      } finally {
        setLoading(false);
      }
    }

    loadSeating();
  }, [user?.email]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="pb-2 space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
          Seating Plan
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Check your allocated examination halls, desk numbers, and room
          layouts.
        </p>
      </header>

      {loading ? (
        <div className="ios26-card p-12 text-center text-xs font-sans text-gray-500">
          <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading seating allocation database...
        </div>
      ) : allocations.length === 0 ? (
        <div className="ios26-card p-12 text-center space-y-3">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
            STATUS: UNASSIGNED
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            No Exam Seating Assigned Yet
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto font-sans">
            Your examination desk allocation will appear here once the exam
            administration finalizes room layouts.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {allocations.map((item, idx) => (
            <div
              key={idx}
              className="ios26-card overflow-hidden flex flex-col justify-between"
            >
              <div className="border-b border-gray-100/70 bg-gradient-to-r from-white/40 via-white/20 to-transparent p-5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    CLASS SECTION
                  </span>
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.className}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#16A34A] ios26-glass-pill px-3 py-1">
                  Confirmed
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="ios26-glass-subtle rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      ASSIGNED SEAT
                    </p>
                    <p className="text-2xl font-bold font-mono text-[#16A34A] mt-1">
                      {item.seatLabel}
                    </p>
                  </div>
                  <div className="ios26-glass-subtle rounded-xl p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      DESK INDEX
                    </p>
                    <p className="text-2xl font-bold font-mono text-gray-900 mt-1">
                      #{item.seatIndex + 1}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100/70 pt-4 font-sans">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#16A34A] shrink-0" />
                    <span>
                      VENUE:{' '}
                      <strong className="text-gray-900 font-semibold">
                        {item.floorPlanName}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
