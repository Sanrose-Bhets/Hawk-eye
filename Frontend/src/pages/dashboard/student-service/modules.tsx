import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListFilter,
  X,
  AlertCircle,
  BookOpen,
  Building2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  moduleApi,
  type CreateModuleData,
  type UpdateModuleData,
} from '@/lib/api/modules';
import { facultyApi } from '@/lib/api/faculties';
import type { Module, Faculty } from '@/lib/types';

interface ModuleFormErrors {
  name?: string | null;
  moduleLeader?: string | null;
  facultyId?: string | null;
  code?: string | null;
}

interface FacultyFormErrors {
  name?: string | null;
  description?: string | null;
}

function hasErrors(obj: ModuleFormErrors | FacultyFormErrors): boolean {
  return Object.values(obj).some(
    (v) => v !== null && v !== undefined && v !== '',
  );
}

function validateModuleName(v: string): string | null {
  if (!v.trim()) return 'Module name is required';
  if (v.trim().length < 2) return 'Module name must be at least 2 characters';
  return null;
}

function validateModuleLeader(v: string): string | null {
  if (!v.trim()) return 'Module leader is required';
  return null;
}

function validateFacultyId(v: string): string | null {
  if (!v) return 'Faculty is required';
  return null;
}

function validateFacultyName(v: string): string | null {
  if (!v.trim()) return 'Faculty name is required';
  if (v.trim().length < 2) return 'Faculty name must be at least 2 characters';
  return null;
}

export default function ModulesPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'faculties'>(
    'modules',
  );

  // ── Module state ──
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleError, setModuleError] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedModuleFaculty, setSelectedModuleFaculty] = useState('');
  const [modulePage, setModulePage] = useState(1);
  const [moduleTotalPages, setModuleTotalPages] = useState(1);
  const [moduleTotal, setModuleTotal] = useState(0);
  const moduleSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [isModuleCreateOpen, setIsModuleCreateOpen] = useState(false);
  const [isModuleEditOpen, setIsModuleEditOpen] = useState(false);
  const [isModuleDetailOpen, setIsModuleDetailOpen] = useState(false);
  const [isModuleDeleteOpen, setIsModuleDeleteOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleSubmitting, setModuleSubmitting] = useState(false);

  const [modName, setModName] = useState('');
  const [modCode, setModCode] = useState('');
  const [modLeader, setModLeader] = useState('');
  const [modFacultyId, setModFacultyId] = useState('');
  const [modFormErrors, setModFormErrors] = useState<ModuleFormErrors>({});
  const [modFormError, setModFormError] = useState('');

  // ── Faculty state ──
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyError, setFacultyError] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyPage, setFacultyPage] = useState(1);
  const [facultyTotalPages, setFacultyTotalPages] = useState(1);
  const [facultyTotal, setFacultyTotal] = useState(0);
  const facultySearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [isFacultyCreateOpen, setIsFacultyCreateOpen] = useState(false);
  const [isFacultyEditOpen, setIsFacultyEditOpen] = useState(false);
  const [isFacultyDeleteOpen, setIsFacultyDeleteOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [facultySubmitting, setFacultySubmitting] = useState(false);

  const [facName, setFacName] = useState('');
  const [facDescription, setFacDescription] = useState('');
  const [facFormErrors, setFacFormErrors] = useState<FacultyFormErrors>({});
  const [facFormError, setFacFormError] = useState('');

  const PAGE_LIMIT = 12;

  // ── Fetch helpers ──

  const fetchModules = useCallback(
    async (search?: string, pageNum?: number, faculty?: string) => {
      setModuleLoading(true);
      setModuleError('');
      try {
        const res = await moduleApi.list({
          page: pageNum ?? modulePage,
          limit: PAGE_LIMIT,
          search: (search ?? moduleSearch) || undefined,
          faculty: (faculty ?? selectedModuleFaculty) || undefined,
        });
        setModules(res.data.data);
        setModuleTotalPages(res.data.totalPages);
        setModuleTotal(res.data.total);
      } catch {
        setModuleError('Failed to load modules. Please try again.');
      } finally {
        setModuleLoading(false);
      }
    },
    [modulePage, moduleSearch, selectedModuleFaculty],
  );

  const fetchFaculties = useCallback(
    async (search?: string, pageNum?: number) => {
      setFacultyLoading(true);
      setFacultyError('');
      try {
        const res = await facultyApi.list({
          page: pageNum ?? facultyPage,
          limit: PAGE_LIMIT,
          search: (search ?? facultySearch) || undefined,
        });
        setFaculties(res.data.data);
        setFacultyTotalPages(res.data.totalPages);
        setFacultyTotal(res.data.total);
      } catch {
        setFacultyError('Failed to load faculties. Please try again.');
      } finally {
        setFacultyLoading(false);
      }
    },
    [facultyPage, facultySearch],
  );

  const fetchAllFaculties = useCallback(async () => {
    try {
      const res = await facultyApi.list({ limit: 100 });
      setFaculties(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchAllFaculties();
  }, [fetchAllFaculties]);

  useEffect(() => {
    if (activeTab === 'faculties') {
      fetchFaculties();
    }
  }, [activeTab, fetchFaculties]);

  const getFacultyName = (facultyId: string) => {
    const f = faculties.find((fac) => fac.id === facultyId);
    return f?.name ?? '—';
  };

  // ── Module search/filter ──

  const handleModuleSearchChange = (value: string) => {
    setModuleSearch(value);
    if (moduleSearchTimeout.current) clearTimeout(moduleSearchTimeout.current);
    moduleSearchTimeout.current = setTimeout(() => {
      setModulePage(1);
      fetchModules(value, 1, selectedModuleFaculty);
    }, 400);
  };

  const handleModuleFacultyChange = (faculty: string) => {
    setSelectedModuleFaculty(faculty);
    setModulePage(1);
    fetchModules(moduleSearch, 1, faculty);
  };

  // ── Faculty search ──

  const handleFacultySearchChange = (value: string) => {
    setFacultySearch(value);
    if (facultySearchTimeout.current)
      clearTimeout(facultySearchTimeout.current);
    facultySearchTimeout.current = setTimeout(() => {
      setFacultyPage(1);
      fetchFaculties(value, 1);
    }, 400);
  };

  // ── Module CRUD ──

  const resetModuleForm = () => {
    setModName('');
    setModCode('');
    setModLeader('');
    setModFacultyId('');
    setModFormErrors({});
    setModFormError('');
  };

  const handleOpenModuleCreate = () => {
    resetModuleForm();
    setIsModuleCreateOpen(true);
  };

  const handleOpenModuleEdit = (mod: Module) => {
    setSelectedModule(mod);
    setModName(mod.name);
    setModCode(mod.code ?? '');
    setModLeader(mod.moduleLeader);
    setModFacultyId(mod.facultyId);
    setModFormErrors({});
    setModFormError('');
    setIsModuleEditOpen(true);
  };

  const handleOpenModuleDetail = (mod: Module) => {
    setSelectedModule(mod);
    setIsModuleDetailOpen(true);
  };

  const handleOpenModuleDelete = (mod: Module) => {
    setSelectedModule(mod);
    setIsModuleDeleteOpen(true);
  };

  const handleModuleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: ModuleFormErrors = {};
    errors.name = validateModuleName(modName);
    errors.moduleLeader = validateModuleLeader(modLeader);
    errors.facultyId = validateFacultyId(modFacultyId);
    setModFormErrors(errors);
    if (hasErrors(errors)) return;

    setModuleSubmitting(true);
    setModFormError('');
    try {
      const data: CreateModuleData = {
        name: modName.trim(),
        moduleLeader: modLeader.trim(),
        facultyId: modFacultyId,
      };
      if (modCode.trim()) data.code = modCode.trim();
      await moduleApi.create(data);
      setIsModuleCreateOpen(false);
      fetchModules(moduleSearch, 1, selectedModuleFaculty);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create module';
      setModFormError(msg);
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleModuleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    const errors: ModuleFormErrors = {};
    errors.name = validateModuleName(modName);
    errors.moduleLeader = validateModuleLeader(modLeader);
    errors.facultyId = validateFacultyId(modFacultyId);
    setModFormErrors(errors);
    if (hasErrors(errors)) return;

    setModuleSubmitting(true);
    setModFormError('');
    try {
      const data: UpdateModuleData = {
        name: modName.trim(),
        moduleLeader: modLeader.trim(),
        facultyId: modFacultyId,
      };
      if (modCode.trim()) data.code = modCode.trim();
      else data.code = '';
      await moduleApi.update(selectedModule.id, data);
      setIsModuleEditOpen(false);
      fetchModules(moduleSearch, modulePage, selectedModuleFaculty);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update module';
      setModFormError(msg);
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleModuleDelete = async () => {
    if (!selectedModule) return;
    setModuleSubmitting(true);
    try {
      await moduleApi.delete(selectedModule.id);
      setIsModuleDeleteOpen(false);
      fetchModules(moduleSearch, modulePage, selectedModuleFaculty);
    } catch {
      setModuleError('Failed to delete module.');
    } finally {
      setModuleSubmitting(false);
    }
  };

  // ── Faculty CRUD ──

  const resetFacultyForm = () => {
    setFacName('');
    setFacDescription('');
    setFacFormErrors({});
    setFacFormError('');
  };

  const handleOpenFacultyCreate = () => {
    resetFacultyForm();
    setIsFacultyCreateOpen(true);
  };

  const handleOpenFacultyEdit = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setFacName(fac.name);
    setFacDescription(fac.description ?? '');
    setFacFormErrors({});
    setFacFormError('');
    setIsFacultyEditOpen(true);
  };

  const handleOpenFacultyDelete = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setIsFacultyDeleteOpen(true);
  };

  const handleFacultyCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: FacultyFormErrors = {};
    errors.name = validateFacultyName(facName);
    setFacFormErrors(errors);
    if (hasErrors(errors)) return;

    setFacultySubmitting(true);
    setFacFormError('');
    try {
      await facultyApi.create({
        name: facName.trim(),
        description: facDescription.trim() || undefined,
      });
      setIsFacultyCreateOpen(false);
      fetchFaculties(facultySearch, 1);
      fetchAllFaculties();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create faculty';
      setFacFormError(msg);
    } finally {
      setFacultySubmitting(false);
    }
  };

  const handleFacultyEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    const errors: FacultyFormErrors = {};
    errors.name = validateFacultyName(facName);
    setFacFormErrors(errors);
    if (hasErrors(errors)) return;

    setFacultySubmitting(true);
    setFacFormError('');
    try {
      await facultyApi.update(selectedFaculty.id, {
        name: facName.trim(),
        description: facDescription.trim() || undefined,
      });
      setIsFacultyEditOpen(false);
      fetchFaculties(facultySearch, facultyPage);
      fetchAllFaculties();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update faculty';
      setFacFormError(msg);
    } finally {
      setFacultySubmitting(false);
    }
  };

  const handleFacultyDelete = async () => {
    if (!selectedFaculty) return;
    setFacultySubmitting(true);
    try {
      await facultyApi.delete(selectedFaculty.id);
      setIsFacultyDeleteOpen(false);
      fetchFaculties(facultySearch, facultyPage);
      fetchAllFaculties();
    } catch {
      setFacultyError('Failed to delete faculty.');
    } finally {
      setFacultySubmitting(false);
    }
  };

  // ── Render ──

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Module Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage curriculum modules, module codes, and faculty assignments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'modules'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen size={16} />
          Modules
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              activeTab === 'modules'
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {moduleTotal}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('faculties')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'faculties'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 size={16} />
          Faculties
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              activeTab === 'faculties'
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {facultyTotal}
          </span>
        </button>
      </div>

      {/* ── MODULES TAB ── */}
      {activeTab === 'modules' && (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder="Search by name, code, or leader..."
                value={moduleSearch}
                onChange={(e) => handleModuleSearchChange(e.target.value)}
                className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
              />
            </div>

            <div className="relative w-full sm:w-auto shrink-0">
              <div className="relative inline-flex w-full sm:w-48 items-center">
                <ListFilter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <select
                  value={selectedModuleFaculty}
                  onChange={(e) => handleModuleFacultyChange(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 focus:border-primary focus:ring-2 focus:ring-primary-ring focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="">All Faculties</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            <Button
              onClick={handleOpenModuleCreate}
              className="cursor-pointer shrink-0"
            >
              <Plus size={18} className="mr-2" />
              Add Module
            </Button>
          </div>

          {moduleError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {moduleError}
              <button
                onClick={() => setModuleError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {moduleLoading ? (
                  <div className="py-16 text-center">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading modules...</p>
                  </div>
                ) : modules.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                      <BookOpen size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No modules found
                    </p>
                    <p className="text-xs text-gray-500">
                      {moduleSearch || selectedModuleFaculty
                        ? 'Try a different search or filter'
                        : 'Create your first module to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
                        onClick={() => handleOpenModuleDetail(mod)}
                      >
                        <div className="flex items-start justify-between">
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 font-mono">
                            {mod.code ?? '—'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModuleEdit(mod);
                              }}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModuleDelete(mod);
                              }}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 mt-3 text-sm leading-snug">
                          {mod.name}
                        </h3>

                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Leader</span>
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">
                              {mod.moduleLeader}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Faculty</span>
                            <span className="font-medium text-gray-900 truncate max-w-[160px]">
                              {getFacultyName(mod.facultyId)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Module Pagination */}
          {moduleTotalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500">
                Page {modulePage} of {moduleTotalPages} ({moduleTotal} modules)
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={modulePage <= 1}
                  onClick={() => {
                    const p = modulePage - 1;
                    setModulePage(p);
                    fetchModules(moduleSearch, p, selectedModuleFaculty);
                  }}
                  className="cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={modulePage >= moduleTotalPages}
                  onClick={() => {
                    const p = modulePage + 1;
                    setModulePage(p);
                    fetchModules(moduleSearch, p, selectedModuleFaculty);
                  }}
                  className="cursor-pointer"
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── FACULTIES TAB ── */}
      {activeTab === 'faculties' && (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <Input
                placeholder="Search faculties by name or description..."
                value={facultySearch}
                onChange={(e) => handleFacultySearchChange(e.target.value)}
                className="h-10 pl-9 text-sm bg-white rounded-xl border-gray-200 focus:border-primary"
              />
            </div>
            <Button
              onClick={handleOpenFacultyCreate}
              className="cursor-pointer shrink-0"
            >
              <Plus size={18} className="mr-2" />
              Add Faculty
            </Button>
          </div>

          {facultyError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {facultyError}
              <button
                onClick={() => setFacultyError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {facultyLoading ? (
                  <div className="py-16 text-center">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Loading faculties...
                    </p>
                  </div>
                ) : faculties.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-3 text-gray-400">
                      <Building2 size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      No faculties found
                    </p>
                    <p className="text-xs text-gray-500">
                      {facultySearch
                        ? 'Try a different search'
                        : 'Create your first faculty to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {faculties.map((fac) => (
                      <div
                        key={fac.id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {fac.name}
                          </p>
                          {fac.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {fac.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                          <button
                            onClick={() => handleOpenFacultyEdit(fac)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenFacultyDelete(fac)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Pagination */}
          {facultyTotalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-500">
                Page {facultyPage} of {facultyTotalPages} ({facultyTotal}{' '}
                faculties)
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={facultyPage <= 1}
                  onClick={() => {
                    const p = facultyPage - 1;
                    setFacultyPage(p);
                    fetchFaculties(facultySearch, p);
                  }}
                  className="cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={facultyPage >= facultyTotalPages}
                  onClick={() => {
                    const p = facultyPage + 1;
                    setFacultyPage(p);
                    fetchFaculties(facultySearch, p);
                  }}
                  className="cursor-pointer"
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── MODALS ── */}
      {/* ══════════════════════════════════════════════ */}

      {/* Module Create Modal */}
      <Modal
        isOpen={isModuleCreateOpen}
        onClose={() => setIsModuleCreateOpen(false)}
        title="Add Module"
        description="Create a new module and assign it to a faculty"
      >
        <form onSubmit={handleModuleCreateSubmit} className="space-y-4">
          {modFormError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {modFormError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Module Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Introduction to Computer Science"
              value={modName}
              onChange={(e) => {
                setModName(e.target.value);
                if (modFormErrors.name) {
                  setModFormErrors((p) => ({ ...p, name: null }));
                }
              }}
              className={modFormErrors.name ? 'border-red-300' : ''}
            />
            {modFormErrors.name && (
              <p className="text-xs text-red-500">{modFormErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Module Code</Label>
            <Input
              placeholder="e.g. CS101"
              value={modCode}
              onChange={(e) => setModCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Module Leader <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Dr. John Smith"
              value={modLeader}
              onChange={(e) => {
                setModLeader(e.target.value);
                if (modFormErrors.moduleLeader) {
                  setModFormErrors((p) => ({ ...p, moduleLeader: null }));
                }
              }}
              className={modFormErrors.moduleLeader ? 'border-red-300' : ''}
            />
            {modFormErrors.moduleLeader && (
              <p className="text-xs text-red-500">
                {modFormErrors.moduleLeader}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Faculty <span className="text-red-500">*</span>
            </Label>
            <select
              value={modFacultyId}
              onChange={(e) => {
                setModFacultyId(e.target.value);
                if (modFormErrors.facultyId) {
                  setModFormErrors((p) => ({ ...p, facultyId: null }));
                }
              }}
              className={`flex h-9 w-full rounded-lg border bg-white px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                modFormErrors.facultyId ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select a faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {modFormErrors.facultyId && (
              <p className="text-xs text-red-500">{modFormErrors.facultyId}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModuleCreateOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={moduleSubmitting}
              className="cursor-pointer"
            >
              {moduleSubmitting ? 'Creating...' : 'Create Module'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Module Edit Modal */}
      <Modal
        isOpen={isModuleEditOpen}
        onClose={() => setIsModuleEditOpen(false)}
        title="Edit Module"
        description="Update module details"
      >
        <form onSubmit={handleModuleEditSubmit} className="space-y-4">
          {modFormError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {modFormError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Module Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Introduction to Computer Science"
              value={modName}
              onChange={(e) => {
                setModName(e.target.value);
                if (modFormErrors.name) {
                  setModFormErrors((p) => ({ ...p, name: null }));
                }
              }}
              className={modFormErrors.name ? 'border-red-300' : ''}
            />
            {modFormErrors.name && (
              <p className="text-xs text-red-500">{modFormErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Module Code</Label>
            <Input
              placeholder="e.g. CS101"
              value={modCode}
              onChange={(e) => setModCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Module Leader <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Dr. John Smith"
              value={modLeader}
              onChange={(e) => {
                setModLeader(e.target.value);
                if (modFormErrors.moduleLeader) {
                  setModFormErrors((p) => ({ ...p, moduleLeader: null }));
                }
              }}
              className={modFormErrors.moduleLeader ? 'border-red-300' : ''}
            />
            {modFormErrors.moduleLeader && (
              <p className="text-xs text-red-500">
                {modFormErrors.moduleLeader}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              Faculty <span className="text-red-500">*</span>
            </Label>
            <select
              value={modFacultyId}
              onChange={(e) => {
                setModFacultyId(e.target.value);
                if (modFormErrors.facultyId) {
                  setModFormErrors((p) => ({ ...p, facultyId: null }));
                }
              }}
              className={`flex h-9 w-full rounded-lg border bg-white px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                modFormErrors.facultyId ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select a faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            {modFormErrors.facultyId && (
              <p className="text-xs text-red-500">{modFormErrors.facultyId}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModuleEditOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={moduleSubmitting}
              className="cursor-pointer"
            >
              {moduleSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Module Detail Modal */}
      <Modal
        isOpen={isModuleDetailOpen}
        onClose={() => setIsModuleDetailOpen(false)}
        title={selectedModule?.name ?? 'Module Details'}
        description={selectedModule?.code ?? undefined}
      >
        {selectedModule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Module Code</p>
                <p className="font-semibold text-gray-900">
                  {selectedModule.code ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Module Leader</p>
                <p className="font-semibold text-gray-900">
                  {selectedModule.moduleLeader}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Faculty</p>
                <p className="font-semibold text-gray-900">
                  {getFacultyName(selectedModule.facultyId)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Created</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedModule.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsModuleDetailOpen(false);
                  handleOpenModuleEdit(selectedModule);
                }}
                className="cursor-pointer"
              >
                <Pencil size={14} className="mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsModuleDetailOpen(false);
                  handleOpenModuleDelete(selectedModule);
                }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Module Delete Confirmation */}
      <Modal
        isOpen={isModuleDeleteOpen}
        onClose={() => setIsModuleDeleteOpen(false)}
        title="Delete Module"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {selectedModule?.name}
          </span>
          ? This will permanently remove the module.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsModuleDeleteOpen(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleModuleDelete}
            disabled={moduleSubmitting}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {moduleSubmitting ? 'Deleting...' : 'Delete Module'}
          </Button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════ */}
      {/* ── FACULTY MODALS ── */}
      {/* ══════════════════════════════════════════════ */}

      {/* Faculty Create Modal */}
      <Modal
        isOpen={isFacultyCreateOpen}
        onClose={() => setIsFacultyCreateOpen(false)}
        title="Add Faculty"
        description="Create a new faculty"
      >
        <form onSubmit={handleFacultyCreateSubmit} className="space-y-4">
          {facFormError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {facFormError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Faculty Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Faculty of Science"
              value={facName}
              onChange={(e) => {
                setFacName(e.target.value);
                if (facFormErrors.name) {
                  setFacFormErrors((p) => ({ ...p, name: null }));
                }
              }}
              className={facFormErrors.name ? 'border-red-300' : ''}
            />
            {facFormErrors.name && (
              <p className="text-xs text-red-500">{facFormErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Optional description"
              value={facDescription}
              onChange={(e) => setFacDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFacultyCreateOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={facultySubmitting}
              className="cursor-pointer"
            >
              {facultySubmitting ? 'Creating...' : 'Create Faculty'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Faculty Edit Modal */}
      <Modal
        isOpen={isFacultyEditOpen}
        onClose={() => setIsFacultyEditOpen(false)}
        title="Edit Faculty"
        description="Update faculty details"
      >
        <form onSubmit={handleFacultyEditSubmit} className="space-y-4">
          {facFormError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {facFormError}
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Faculty Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Faculty of Science"
              value={facName}
              onChange={(e) => {
                setFacName(e.target.value);
                if (facFormErrors.name) {
                  setFacFormErrors((p) => ({ ...p, name: null }));
                }
              }}
              className={facFormErrors.name ? 'border-red-300' : ''}
            />
            {facFormErrors.name && (
              <p className="text-xs text-red-500">{facFormErrors.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Optional description"
              value={facDescription}
              onChange={(e) => setFacDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFacultyEditOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={facultySubmitting}
              className="cursor-pointer"
            >
              {facultySubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Faculty Delete Confirmation */}
      <Modal
        isOpen={isFacultyDeleteOpen}
        onClose={() => setIsFacultyDeleteOpen(false)}
        title="Delete Faculty"
        description="This action cannot be undone"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {selectedFaculty?.name}
          </span>
          ? This will permanently remove the faculty.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsFacultyDeleteOpen(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleFacultyDelete}
            disabled={facultySubmitting}
            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {facultySubmitting ? 'Deleting...' : 'Delete Faculty'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
