import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Mail,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { SidebarUserMenu } from '@/components/dashboard/sidebar-user-menu';
import { useSidebar } from '@/context/sidebar-context';

const links = [
  {
    to: '/dashboard/student-service',
    label: 'Dashboard',
    description: 'Overview and quick metrics',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/dashboard/student-service/students',
    label: 'Students',
    description: 'Enrolled students directory',
    icon: Users,
  },
  {
    to: '/dashboard/student-service/modules',
    label: 'Module Management',
    description: 'Courses, credits & curriculum',
    icon: BookOpen,
  },
  {
    to: '/dashboard/student-service/results',
    label: 'Results',
    description: 'Exam grades & evaluations',
    icon: Award,
  },
  {
    to: '/dashboard/student-service/mail',
    label: 'Mail Management',
    description: 'Broadcasts & notifications',
    icon: Mail,
  },
  {
    to: '/dashboard/student-service/backup',
    label: 'Backup',
    description: 'Export and import system data',
    icon: Database,
  },
];

export function StudentServiceSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-gray-200 bg-white select-none transition-all duration-300 ease-in-out shrink-0',
        isCollapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'border-b border-gray-200 flex items-center transition-all duration-300',
          isCollapsed
            ? 'px-3 py-4 justify-center'
            : 'px-6 py-5 justify-between',
        )}
      >
        {!isCollapsed && (
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight truncate">
            Student Service
          </h1>
        )}

        <Tooltip
          content={
            isCollapsed
              ? 'Expand Sidebar (Ctrl+B)'
              : 'Collapse Sidebar (Ctrl+B)'
          }
          side={isCollapsed ? 'right' : 'bottom'}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden transition-all duration-300',
          isCollapsed ? 'px-2.5' : 'px-3',
        )}
      >
        {links.map(({ to, label, description, icon: Icon, end }) => (
          <Tooltip
            key={to}
            content={
              isCollapsed ? (
                <div>
                  <div className="font-semibold">{label}</div>
                  <div className="text-[10px] text-gray-300">{description}</div>
                </div>
              ) : (
                description
              )
            }
            side="right"
            wrapperClassName="w-full"
          >
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center rounded-xl text-sm font-medium transition-colors',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* User Dropdown */}
      <div className="border-t border-gray-200 p-2.5">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}
