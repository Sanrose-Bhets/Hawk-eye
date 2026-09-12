import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  GraduationCap,
  Award,
  CalendarDays,
  ClipboardList,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { SidebarUserMenu } from '@/components/dashboard/sidebar-user-menu';

const links = [
  {
    to: '/dashboard/rte/floor-plans',
    label: 'Floor Plans',
    description: 'Design and manage room seating layouts',
    icon: LayoutGrid,
  },
  {
    to: '/dashboard/rte/classes',
    label: 'Classes',
    description: 'Manage class lists and seat allocations',
    icon: GraduationCap,
  },
  {
    to: '/dashboard/rte/results',
    label: 'Results',
    description: 'Exam grades & evaluations',
    icon: Award,
  },
  {
    to: '/dashboard/rte/calendar',
    label: 'Calendar',
    description: 'Schedule and notes',
    icon: CalendarDays,
  },
  {
    to: '/dashboard/rte/exam-routines',
    label: 'Exam Routines',
    description: 'Manage examination schedules',
    icon: ClipboardList,
  },
  {
    to: '/dashboard/rte/backup',
    label: 'Backup',
    description: 'Export and import system data',
    icon: Database,
  },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight">
          RTE Dashboard
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, description, icon: Icon }) => (
          <Tooltip
            key={to}
            content={description}
            side="right"
            wrapperClassName="w-full"
          >
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}

export const RteSidebar = Sidebar;
