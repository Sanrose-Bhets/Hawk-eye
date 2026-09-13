import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { moduleApi } from '@/lib/api/modules';
import { facultyApi } from '@/lib/api/faculties';
import type { Module, Faculty } from '@/lib/types';

const DEMO_MODULES: Module[] = [
  {
    id: 'mod-1',
    name: 'Artificial Intelligence & Neural Systems',
    code: 'CS6001',
    facultyId: 'fac-comp',
    moduleLeader: 'Dr. Julian Croft',
    semesters: [3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mod-2',
    name: 'Distributed Systems & Microservices',
    code: 'CS6002',
    facultyId: 'fac-comp',
    moduleLeader: 'Prof. Elena Rostova',
    semesters: [3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mod-3',
    name: 'DevOps & Continuous Integration',
    code: 'CS6003',
    facultyId: 'fac-comp',
    moduleLeader: 'Marcus Vance',
    semesters: [3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mod-4',
    name: 'Capstone System Architecture',
    code: 'CS6004',
    facultyId: 'fac-comp',
    moduleLeader: 'Dr. Samantha Reed',
    semesters: [3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function StudentModulesPage() {
  const [modules, setModules] = useState<Module[]>(DEMO_MODULES);
  const [facultyMap, setFacultyMap] = useState<Map<string, string>>(
    new Map([['fac-comp', 'Faculty of Computing & IT']]),
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [modulesRes, facultiesRes] = await Promise.all([
          moduleApi.list({ limit: 50 }),
          facultyApi.list({ limit: 50 }),
        ]);

        const loadedModules = modulesRes.data?.data || [];
        if (loadedModules.length > 0) {
          setModules(loadedModules);
        } else {
          setModules(DEMO_MODULES);
        }

        const facs: Faculty[] = facultiesRes.data?.data || [];
        if (facs.length > 0) {
          setFacultyMap(new Map(facs.map((f) => [f.id, f.name])));
        }
      } catch (err) {
        console.error('Failed to load modules:', err);
        setModules(DEMO_MODULES);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(search.toLowerCase())) ||
      m.moduleLeader.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <header className="pb-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
              My Modules
            </h1>
            <p className="text-sm text-gray-500 font-sans">
              Browse registered curriculum courses, credit codes, and faculty
              module leaders.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search module or leader..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-sans ios26-glass-pill rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A]/50 transition-all text-gray-900"
            />
          </div>
        </div>
      </header>

      {/* Modules Table / Grid */}
      {loading ? (
        <div className="ios26-card p-12 text-center text-xs font-sans text-gray-500">
          <div className="h-5 w-5 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading curriculum modules...
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="ios26-card p-12 text-center space-y-2">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-400">
            NO MODULES MATCHED
          </p>
          <p className="text-xs text-gray-500 font-sans">
            {search
              ? 'Try modifying your search criteria.'
              : 'No courses registered in this semester.'}
          </p>
        </div>
      ) : (
        <div className="ios26-card overflow-hidden divide-y divide-gray-100/80">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/40 border-b border-gray-100/60 text-[11px] font-mono font-medium tracking-wider text-gray-400 uppercase">
            <div className="col-span-2">CODE</div>
            <div className="col-span-4">MODULE TITLE</div>
            <div className="col-span-3">FACULTY</div>
            <div className="col-span-3">MODULE LEADER</div>
          </div>

          {filteredModules.map((module, i) => (
            <div
              key={module.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-white/60 transition-colors"
            >
              <div className="col-span-2 font-mono text-xs font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-gray-400 text-[11px]">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#16A34A]/10 text-[#16A34A] font-semibold text-[11px]">
                  {module.code || 'CORE'}
                </span>
              </div>

              <div className="col-span-4">
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                  {module.name}
                </h3>
              </div>

              <div className="col-span-3 text-xs text-gray-600 font-sans">
                {facultyMap.get(module.facultyId) || '—'}
              </div>

              <div className="col-span-3 text-xs text-gray-600 font-sans">
                {module.moduleLeader}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
