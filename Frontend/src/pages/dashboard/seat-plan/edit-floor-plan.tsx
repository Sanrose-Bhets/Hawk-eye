import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SeatCanvas } from '@/components/seat-plan/seat-canvas';
import { floorPlanApi } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { SeatPosition } from '@/lib/types';

export default function EditFloorPlanPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [seats, setSeats] = useState<SeatPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    floorPlanApi
      .get(id)
      .then((r) => {
        setName(r.data.name);
        setSeats(r.data.seats);
        setLoading(false);
      })
      .catch(() => {
        navigate(`${basePath}/floor-plans`);
      });
  }, [id, navigate, basePath]);

  const handleSave = async () => {
    if (!id) return;
    if (!name.trim()) {
      setError('Please enter a floor plan name');
      return;
    }
    if (seats.length === 0) {
      setError('Please add at least one seat');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await floorPlanApi.update(id, { name: name.trim(), seats });
      navigate(`${basePath}/floor-plans`);
    } catch {
      setError('Failed to save floor plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`${basePath}/floor-plans`)}
          className="-ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Floor Plans
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
          Edit Floor Plan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Modify seating arrangement and layout properties
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Plan Details
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="planName" required>
              Floor Plan Name
            </Label>
            <Input
              id="planName"
              placeholder="e.g. Room 101 Layout"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Seat Layout
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              Drag seats to arrange layout
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <SeatCanvas seats={seats} onChange={setSeats} />
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`${basePath}/floor-plans`)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
