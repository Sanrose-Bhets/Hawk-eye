import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { floorPlanApi } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { FloorPlan } from '@/lib/types';

export default function FloorPlansPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const [plans, setPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
            Floor Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit and manage reusable seating arrangements
          </p>
        </div>
        <Button
          onClick={() => navigate(`${basePath}/floor-plans/new`)}
          className="shrink-0 gap-2"
        >
          <Plus size={18} />
          New Floor Plan
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <LayoutGrid size={32} className="text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">
              No floor plans yet
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Create a floor plan to start designing seat layouts
            </p>
            <Button
              onClick={() => navigate(`${basePath}/floor-plans/new`)}
              className="gap-2"
            >
              <Plus size={18} />
              New Floor Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg font-title truncate group-hover:text-primary transition-colors">
                        {plan.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {plan.seats.length} seat
                          {plan.seats.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`${basePath}/floor-plans/${plan.id}/edit`)
                        }
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        title="Edit Floor Plan"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPlanToDelete(plan)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Floor Plan"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {plan.seats.slice(0, 8).map((seat, i) => (
                      <span
                        key={i}
                        className="inline-flex h-7 min-w-8 px-2 items-center justify-center rounded-lg bg-gray-50 border border-gray-200/70 text-xs font-semibold text-gray-700"
                      >
                        {seat.label}
                      </span>
                    ))}
                    {plan.seats.length > 8 && (
                      <span className="inline-flex h-7 items-center px-2 text-xs font-medium text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        +{plan.seats.length - 8} more
                      </span>
                    )}
                  </div>
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
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPlanToDelete(null)}
              disabled={isDeleting}
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
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
