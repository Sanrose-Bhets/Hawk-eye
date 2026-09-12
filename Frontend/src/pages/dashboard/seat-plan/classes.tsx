import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Trash2,
  GraduationCap,
  Search,
  ArrowRight,
  Layers,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { classApi, floorPlanApi } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { ClassData, FloorPlan } from '@/lib/types';

export default function ClassesPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      classApi.list().catch(() => ({ data: [] })),
      floorPlanApi.list().catch(() => ({ data: [] })),
    ])
      .then(([classRes, planRes]) => {
        setClasses(classRes.data || []);
        setFloorPlans(planRes.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const floorPlanMap = useMemo(() => {
    const map = new Map<string, FloorPlan>();
    floorPlans.forEach((fp) => map.set(fp.id, fp));
    return map;
  }, [floorPlans]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter((cls) => {
      const planName = floorPlanMap.get(cls.floorPlanId)?.name || '';
      return (
        cls.name.toLowerCase().includes(q) ||
        planName.toLowerCase().includes(q) ||
        cls.assignments.some(
          (a) =>
            a.studentName.toLowerCase().includes(q) ||
            a.studentEmail.toLowerCase().includes(q),
        )
      );
    });
  }, [classes, searchQuery, floorPlanMap]);

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    setIsDeleting(true);
    try {
      await classApi.delete(classToDelete.id);
      setClasses(classes.filter((c) => c.id !== classToDelete.id));
      setClassToDelete(null);
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
            Classes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage classroom allocations, student rosters, and seating charts
          </p>
        </div>
        <Button
          onClick={() => navigate(`${basePath}/classes/new`)}
          className="shrink-0 gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          New Class
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search by class name, student name, email, or floor plan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-gray-200 shadow-2xs rounded-xl text-sm"
        />
      </div>

      {/* Content Grid */}
      {loading ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-gray-500">Loading classes...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4 text-gray-400">
              <GraduationCap size={32} />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No matching classes' : 'No classes yet'}
            </p>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              {searchQuery
                ? 'Try searching with a different keyword or student name'
                : 'Create a class to map students into an architectural floor plan layout'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate(`${basePath}/classes/new`)}
                className="gap-2 cursor-pointer"
              >
                <Plus size={18} />
                New Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => {
            const plan = floorPlanMap.get(cls.floorPlanId);
            const totalSeats = plan?.seats.length || cls.assignments.length;
            const assignedCount = cls.assignments.length;
            const fillPercentage = totalSeats
              ? Math.min(Math.round((assignedCount / totalSeats) * 100), 100)
              : 0;

            return (
              <Card
                key={cls.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  {/* Top Content */}
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary border border-primary/10">
                          <GraduationCap size={19} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-gray-900 text-base font-title truncate group-hover:text-primary transition-colors"
                            title={cls.name}
                          >
                            {cls.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 truncate">
                            <Layers
                              size={13}
                              className="text-gray-400 shrink-0"
                            />
                            <span className="truncate">
                              {plan ? plan.name : 'Custom Layout'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`${basePath}/classes/${cls.id}`)
                          }
                          className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                          title="View Class Detail"
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setClassToDelete(cls)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-600 flex items-center gap-1.5">
                          <UserCheck size={13} className="text-primary" />
                          Roster Allocation
                        </span>
                        <span className="font-semibold text-gray-900">
                          {assignedCount}
                          <span className="text-gray-400 font-normal">
                            {' '}
                            / {totalSeats} seats
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Student Roster Badges */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5 min-h-[32px] items-center">
                      {cls.assignments.length > 0 ? (
                        <>
                          {cls.assignments.slice(0, 4).map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex h-6 items-center rounded-md bg-gray-50 border border-gray-200/80 px-2 text-[11px] font-medium text-gray-700 max-w-[110px] truncate"
                              title={`${a.studentName} (${a.studentEmail})`}
                            >
                              {a.studentName.split(' ')[0]}
                            </span>
                          ))}
                          {cls.assignments.length > 4 && (
                            <span className="inline-flex h-6 items-center px-2 text-[11px] font-medium text-gray-500 bg-gray-50/70 rounded-md border border-dashed border-gray-200">
                              +{cls.assignments.length - 4} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No students assigned yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-400">
                      {cls.assignments.length} assigned
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`${basePath}/classes/${cls.id}`)}
                      className="h-8 text-xs font-semibold gap-1.5 text-gray-700 hover:text-primary hover:border-primary/40 rounded-lg cursor-pointer"
                    >
                      <span>View Seating Plan</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!classToDelete}
        onClose={() => !isDeleting && setClassToDelete(null)}
        title="Delete Class"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="font-semibold text-gray-900">
              {classToDelete?.name}
            </strong>
            ? This will remove all seat assignments associated with this class.
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClassToDelete(null)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Class'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
