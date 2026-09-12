import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  Layers,
  Armchair,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { floorPlanApi } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { FloorPlan, SeatPosition } from '@/lib/types';

function FloorPlanMiniPreview({ seats }: { seats: SeatPosition[] }) {
  if (!seats || seats.length === 0) {
    return (
      <div className="h-32 w-full rounded-xl bg-gray-50/80 border border-dashed border-gray-200 flex flex-col items-center justify-center p-3 text-center">
        <LayoutGrid size={20} className="text-gray-300 mb-1" />
        <span className="text-[11px] font-medium text-gray-400">
          No desks configured
        </span>
      </div>
    );
  }

  // Calculate bounding box for normalization
  const xs = seats.map((s) => s.x);
  const ys = seats.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rawWidth = Math.max(maxX - minX + 110, 240);
  const rawHeight = Math.max(maxY - minY + 90, 150);

  return (
    <div className="relative h-32 w-full rounded-xl bg-gradient-to-b from-gray-50/90 to-gray-50/40 border border-gray-200/80 overflow-hidden p-2 flex flex-col justify-between select-none">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #94a3b8 0.75px, transparent 0.75px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Front Board Bar */}
      <div className="relative z-10 mx-auto w-24 h-1.5 rounded-full bg-gray-300 shadow-2xs flex items-center justify-center">
        <span className="sr-only">Front Board</span>
      </div>

      {/* Mini Desks Container */}
      <div className="relative z-10 flex-1 w-full my-1">
        <svg
          viewBox={`0 0 ${rawWidth} ${rawHeight}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {seats.map((seat, idx) => {
            const normX = seat.x - minX + 15;
            const normY = seat.y - minY + 10;
            return (
              <g key={`${seat.label}-${idx}`}>
                <rect
                  x={normX}
                  y={normY}
                  width={72}
                  height={44}
                  rx={8}
                  className="fill-white stroke-gray-300 stroke-[1.5] shadow-2xs"
                />
                <text
                  x={normX + 36}
                  y={normY + 26}
                  textAnchor="middle"
                  className="text-[14px] font-bold fill-gray-700 tracking-tight select-none"
                >
                  {seat.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom metadata tags */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-semibold tracking-wider text-gray-400 uppercase px-1">
        <span>Front</span>
        <span>Door</span>
      </div>
    </div>
  );
}

export default function FloorPlansPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const [plans, setPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planToDelete, setPlanToDelete] = useState<FloorPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    floorPlanApi
      .list()
      .then((r) => {
        setPlans(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const q = searchQuery.toLowerCase();
    return plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(q) ||
        plan.seats.some((s) => s.label.toLowerCase().includes(q)),
    );
  }, [plans, searchQuery]);

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await floorPlanApi.delete(planToDelete.id);
      setPlans(plans.filter((p) => p.id !== planToDelete.id));
      setPlanToDelete(null);
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
            Floor Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, design, and manage architectural exam room desk layouts
          </p>
        </div>
        <Button
          onClick={() => navigate(`${basePath}/floor-plans/new`)}
          className="shrink-0 gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          New Floor Plan
        </Button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search floor plans or seat codes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-gray-200 shadow-2xs rounded-xl text-sm"
        />
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-gray-500">Loading floor plans...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <Card className="rounded-2xl border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4 text-gray-400">
              <LayoutGrid size={32} />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No matching floor plans' : 'No floor plans yet'}
            </p>
            <p className="text-sm text-gray-500 max-w-sm mb-5">
              {searchQuery
                ? 'Try searching with a different room name or seat identifier'
                : 'Create your first floor plan layout to arrange classroom examination seats'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate(`${basePath}/floor-plans/new`)}
                className="gap-2 cursor-pointer"
              >
                <Plus size={18} />
                New Floor Plan
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                {/* Header Top Row */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary border border-primary/10">
                        <Layers size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold text-gray-900 text-base font-title truncate group-hover:text-primary transition-colors"
                          title={plan.name}
                        >
                          {plan.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                            <Armchair size={13} className="text-gray-400" />
                            {plan.seats.length} Desk
                            {plan.seats.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`${basePath}/floor-plans/${plan.id}/edit`)
                        }
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        title="Edit Layout"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPlanToDelete(plan)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        title="Delete Floor Plan"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>

                  {/* Architectural Blueprint Preview Box */}
                  <div className="mt-4">
                    <FloorPlanMiniPreview seats={plan.seats} />
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-400">
                    Capacity: {plan.seats.length} seats
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`${basePath}/floor-plans/${plan.id}/edit`)
                    }
                    className="h-8 text-xs font-semibold gap-1.5 text-gray-700 hover:text-primary hover:border-primary/40 rounded-lg cursor-pointer"
                  >
                    <span>Edit Layout</span>
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!planToDelete}
        onClose={() => !isDeleting && setPlanToDelete(null)}
        title="Delete Floor Plan"
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="font-semibold text-gray-900">
              {planToDelete?.name}
            </strong>
            ? Any class seating plans associated with this floor plan may be
            affected. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlanToDelete(null)}
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
              {isDeleting ? 'Deleting...' : 'Delete Floor Plan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
