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
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage class seat assignments
          </p>
        </div>
        <Button onClick={() => navigate(`${basePath}/classes/new`)}>
          <Plus size={18} className="mr-2" />
          New Class
        </Button>
      </div>

      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Search by class or student name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
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
              <Button onClick={() => navigate(`${basePath}/classes/new`)}>
                <Plus size={18} className="mr-2" />
                New Class
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {cls.assignments.length} student
                      {cls.assignments.length !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`${basePath}/classes/${cls.id}`)}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setClassToDelete(cls)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                {cls.assignments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cls.assignments.slice(0, 5).map((a, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        <span className="font-medium">
                          {a.studentName.split(' ')[0]}
                        </span>
                      </span>
                    ))}
                    {cls.assignments.length > 5 && (
                      <span className="inline-flex items-center px-2 text-xs text-gray-400">
                        +{cls.assignments.length - 5} more
                      </span>
                    )}
                  </div>
                )}
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
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-xs cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
