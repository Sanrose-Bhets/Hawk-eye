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

export default function StudentSeatingPage() {
  const user = useSelector(selectCurrentUser);
  const [allocations, setAllocations] = useState<StudentSeatAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeating() {
      try {
        setLoading(true);
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
                `Seat #${assignment.seatIndex + 1}`;
              found.push({
                className: cls.name,
                floorPlanName: fp?.name || 'Examination Hall',
                seatLabel,
                seatIndex: assignment.seatIndex,
              });
            }
          });
        });

        setAllocations(found);
      } catch (err) {
        console.error('Failed to load student seating:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.email) {
      loadSeating();
    }
  }, [user?.email]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
          Seating Plan
        </h1>
        <p className="text-sm text-gray-500 font-sans">
          Check your allocated examination halls, desk numbers, and room
          layouts.
        </p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 font-sans">
          Loading seating allocation database...
        </div>
      ) : allocations.length === 0 ? (
        <div className="border border-gray-200 bg-white p-12 text-center space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            STATUS: UNASSIGNED
          </p>
          <h2 className="text-xl font-bold text-gray-900 uppercase">
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
              className="border border-gray-200 bg-white flex flex-col justify-between"
            >
              <div className="border-b border-gray-200 bg-gray-50 p-5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    CLASS SECTION
                  </span>
                  <h3 className="text-base font-bold text-gray-900 uppercase">
                    {item.className}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-primary border border-primary px-2 py-0.5">
                  CONFIRMED
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 border border-gray-200 divide-x divide-gray-200 bg-gray-50/50">
                  <div className="p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-sans">
                      ASSIGNED SEAT
                    </p>
                    <p className="text-3xl font-bold font-mono text-primary mt-1">
                      {item.seatLabel}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-sans">
                      DESK INDEX
                    </p>
                    <p className="text-3xl font-bold font-mono text-gray-900 mt-1">
                      #{item.seatIndex + 1}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-gray-600 border-t border-gray-100 pt-4 font-sans">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span>
                      VENUE:{' '}
                      <strong className="text-gray-900">
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
