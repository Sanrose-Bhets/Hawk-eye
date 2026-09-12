import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { classApi } from '@/lib/api/seat-plan';
import { useDashboardBase } from '@/lib/hooks/use-dashboard-base';
import type { ClassData } from '@/lib/types';

export default function ClassesPage() {
  const navigate = useNavigate();
  const basePath = useDashboardBase();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classToDelete, setClassToDelete] = useState<ClassData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    classApi
      .list()
      .then((r) => {
        setClasses(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(
      (cls) =>
        cls.name.toLowerCase().includes(q) ||
        cls.assignments.some(
          (a) =>
            a.studentName.toLowerCase().includes(q) ||
            a.studentEmail.toLowerCase().includes(q),
        ),
    );
  }, [classes, searchQuery]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-title text-gray-900 tracking-tight">
            Classes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage class seat assignments and student rosters
          </p>
        </div>
        <Button
          onClick={() => navigate(`${basePath}/classes/new`)}
          className="shrink-0 gap-2"
        >
          <Plus size={18} />
          New Class
        </Button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search by class or student name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
              <GraduationCap size={32} className="text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-900 mb-1">
              {searchQuery ? 'No matching classes' : 'No classes yet'}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {searchQuery
                ? 'Try a different search term'
                : 'Create a class to start assigning seats'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate(`${basePath}/classes/new`)}
                className="gap-2"
              >
                <Plus size={18} />
                New Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <Card
              key={cls.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg font-title truncate group-hover:text-primary transition-colors">
                        {cls.name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {cls.assignments.length} student
                          {cls.assignments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`${basePath}/classes/${cls.id}`)
                        }
                        className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        title="View Class"
                      >
                        <Eye size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setClassToDelete(cls)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                  {cls.assignments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {cls.assignments.slice(0, 5).map((a, i) => (
                        <span
                          key={i}
                          className="inline-flex h-7 items-center rounded-lg bg-gray-50 border border-gray-200/70 px-2 text-xs font-medium text-gray-700"
                        >
                          {a.studentName.split(' ')[0]}
                        </span>
                      ))}
                      {cls.assignments.length > 5 && (
                        <span className="inline-flex h-7 items-center px-2 text-xs font-medium text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                          +{cls.assignments.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
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
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClassToDelete(null)}
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
