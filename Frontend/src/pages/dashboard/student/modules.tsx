import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { moduleApi } from '@/lib/api/modules';
import { facultyApi } from '@/lib/api/faculties';
import type { Module, Faculty } from '@/lib/types';

export default function StudentModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [facultyMap, setFacultyMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [modulesRes, facultiesRes] = await Promise.all([
          moduleApi.list({ limit: 50 }),
          facultyApi.list({ limit: 50 }),
        ]);

        setModules(modulesRes.data?.data || []);

        const facs: Faculty[] = facultiesRes.data?.data || [];
        setFacultyMap(new Map(facs.map((f) => [f.id, f.name])));
      } catch (err) {
        console.error('Failed to load modules:', err);
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
    <div className="w-full max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH MODULE OR LEADER..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:border-primary rounded-[2px]"
            />
          </div>
        </div>
      </header>

      {/* Modules Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gray-500 font-sans">
          Loading curriculum modules...
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="border border-gray-200 bg-white p-12 text-center space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
            NO MODULES MATCHED
          </p>
          <p className="text-xs text-gray-500 font-sans">
            {search
              ? 'Try modifying your search criteria.'
              : 'No courses registered in this semester.'}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-white border-b border-gray-200 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
            <div className="col-span-2">CODE</div>
            <div className="col-span-4">MODULE TITLE</div>
            <div className="col-span-3">FACULTY</div>
            <div className="col-span-3">MODULE LEADER</div>
          </div>

          {filteredModules.map((module, i) => (
            <div
              key={module.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-5 md:px-6 md:py-4 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-2 font-mono text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="text-gray-300">0{i + 1}</span>
                <span className="text-primary font-semibold">
                  {module.code || 'CORE'}
                </span>
              </div>

              <div className="col-span-4">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  {module.name}
                </h3>
              </div>

              <div className="col-span-3 font-mono text-xs text-gray-700 font-sans">
                {facultyMap.get(module.facultyId) || '—'}
              </div>

              <div className="col-span-3 font-mono text-xs text-gray-700 font-sans">
                {module.moduleLeader}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
