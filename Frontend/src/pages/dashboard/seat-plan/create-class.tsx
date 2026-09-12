import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { classApi, floorPlanApi, DUMMY_STUDENTS } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { FloorPlan, ClassData } from '@/lib/types';

export default function CreateClassPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const [name, setName] = useState('');
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [existingClasses, setExistingClasses] = useState<ClassData[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([floorPlanApi.list(), classApi.list()]).then(
      ([fpRes, clRes]) => {
        setFloorPlans(fpRes.data);
        setExistingClasses(clRes.data);
      },
    );
  }, []);

  const takenEmails = useMemo(() => {
    const emails = new Set<string>();
    existingClasses.forEach((c) => {
      c.assignments.forEach((a) => emails.add(a.studentEmail));
    });
    return emails;
  }, [existingClasses]);

  const selectedPlan = floorPlans.find((p) => p.id === selectedPlanId);
  const seatCount = selectedPlan?.seats.length ?? 0;

  const availableStudents = useMemo(() => {
    return [...DUMMY_STUDENTS]
      .filter((s) => !takenEmails.has(s.email))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [takenEmails]);

  const autoAssigned = useMemo(() => {
    return availableStudents.slice(0, seatCount);
  }, [availableStudents, seatCount]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a class name');
      return;
    }
    if (!selectedPlanId) {
      setError('Please select a floor plan');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const assignments = autoAssigned.map((student, i) => ({
        seatIndex: i,
        studentName: student.name,
        studentEmail: student.email,
      }));

      await classApi.create({
        name: name.trim(),
        floorPlanId: selectedPlanId,
        assignments,
      });
      navigate(`${basePath}/classes`);
    } catch {
      setError('Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`${basePath}/classes`)}
        className="mb-4 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Classes
      </Button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Class</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold text-gray-900">
            Class Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="className" required>
              Class Name
            </Label>
            <Input
              id="className"
              placeholder="e.g. Grade 10 - Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floorPlan" required>
              Floor Plan
            </Label>
            {floorPlans.length === 0 ? (
              <p className="text-sm text-gray-500">
                No floor plans available.{' '}
                <button
                  onClick={() => navigate(`${basePath}/floor-plans/new`)}
                  className="text-primary hover:underline cursor-pointer font-medium"
                >
                  Create one first
                </button>
              </p>
            ) : (
              <select
                id="floorPlan"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary-ring focus:outline-none appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select a floor plan</option>
                {floorPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.seats.length} seats)
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedPlan && (
            <div className="rounded-xl border border-primary/30 bg-primary-light p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {autoAssigned.length} students will be assigned (
                  {availableStudents.length} available)
                </span>
              </div>
              {autoAssigned.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {autoAssigned.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No available students left to assign
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Student List
              </h2>
              <span className="text-sm text-gray-500">
                {availableStudents.length} available / {DUMMY_STUDENTS.length}{' '}
                total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
              {DUMMY_STUDENTS.sort((a, b) => a.name.localeCompare(b.name)).map(
                (student) => {
                  const isTaken = takenEmails.has(student.email);
                  const isAssignedToNew = autoAssigned.some(
                    (a) => a.id === student.id,
                  );
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 px-4 py-3 text-sm ${
                        isAssignedToNew
                          ? 'bg-primary-light'
                          : isTaken
                            ? 'opacity-50 bg-gray-50'
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
                      {isAssignedToNew ? (
                        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-white shrink-0">
                          Assigned
                        </span>
                      ) : isTaken ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 shrink-0">
                          Taken
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

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} disabled={saving || !selectedPlanId}>
          {saving ? 'Creating...' : 'Create Class'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`${basePath}/classes`)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
