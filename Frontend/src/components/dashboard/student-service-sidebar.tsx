import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Mail,
  GraduationCap,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { SidebarUserMenu } from '@/components/dashboard/sidebar-user-menu';

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
    to: '/dashboard/student-service/classes',
    label: 'Classes',
    description: 'Class seat allocations',
    icon: GraduationCap,
  },
];

export function StudentServiceSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
          <Headphones size={20} />
        </div>
        <div>
          <span className="text-base font-semibold text-gray-900 block leading-tight">
            Student Service
          </span>
          <span className="text-xs text-gray-500 font-medium">Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, description, icon: Icon, end }) => (
          <Tooltip
            key={to}
            content={description}
            side="right"
            wrapperClassName="w-full"
          >
            <NavLink
              to={to}
              end={end}
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

      {/* User Dropdown */}
      <div className="border-t border-gray-200 p-3">
        <SidebarUserMenu roleTitle="Student Service" />
      </div>
    </aside>
  );
}
