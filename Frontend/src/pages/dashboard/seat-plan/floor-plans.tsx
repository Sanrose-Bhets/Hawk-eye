import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, LayoutGrid, AlertTriangle } from 'lucide-react';
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Floor Plans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable seat layouts
          </p>
        </div>
        <Button onClick={() => navigate(`${basePath}/floor-plans/new`)}>
          <Plus size={18} className="mr-2" />
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
            <Button onClick={() => navigate(`${basePath}/floor-plans/new`)}>
              <Plus size={18} className="mr-2" />
              New Floor Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.seats.length} seat
                      {plan.seats.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`${basePath}/floor-plans/${plan.id}/edit`)
                      }
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPlanToDelete(plan)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {plan.seats.slice(0, 8).map((seat, i) => (
                    <span
                      key={i}
                      className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600"
                    >
                      {seat.label}
                    </span>
                  ))}
                  {plan.seats.length > 8 && (
                    <span className="inline-flex h-7 items-center px-2 text-xs text-gray-400">
                      +{plan.seats.length - 8} more
                    </span>
                  )}
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
        description="Are you sure you want to delete this floor plan? This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-amber-800 text-xs font-medium">
            <AlertTriangle size={18} className="shrink-0 text-amber-600" />
            <span>
              Deleting{' '}
              <strong className="font-semibold">{planToDelete?.name}</strong>{' '}
              will permanently remove this layout template.
            </span>
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
              {isDeleting ? 'Deleting...' : 'Delete Floor Plan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
