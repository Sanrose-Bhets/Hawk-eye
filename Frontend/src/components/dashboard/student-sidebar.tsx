import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  GraduationCap,
  ChevronDown,
  Clock,
  Armchair,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { SidebarUserMenu } from '@/components/dashboard/sidebar-user-menu';

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items?: NavItem[];
  isDropdown?: boolean;
  dropdownTitle?: string;
  dropdownDescription?: string;
  dropdownIcon?: typeof GraduationCap;
  dropdownItems?: NavItem[];
}

export function StudentSidebar() {
  const location = useLocation();
  const isExamActive =
    location.pathname.startsWith('/dashboard/student/examination') ||
    location.pathname === '/dashboard/student/seating';

  const [isExamOpen, setIsExamOpen] = useState(isExamActive);

  useEffect(() => {
    if (isExamActive) {
      setIsExamOpen(true);
    }
  }, [isExamActive]);

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        {
          to: '/dashboard/student',
          label: 'Dashboard',
          description: 'Overview and academic status',
          icon: LayoutDashboard,
          end: true,
        },
      ],
    },
    {
      groupTitle: 'ACADEMIC',
      items: [
        {
          to: '/dashboard/student/results',
          label: 'My Results',
          description: 'Published grades & transcripts',
          icon: Award,
        },
        {
          to: '/dashboard/student/modules',
          label: 'My Modules',
          description: 'Enrolled courses & leaders',
          icon: BookOpen,
        },
      ],
    },
    {
      groupTitle: 'EXAMINATION',
      isDropdown: true,
      dropdownTitle: 'Examination',
      dropdownDescription: "Today's exam, seating & upcoming timetable",
      dropdownIcon: GraduationCap,
      dropdownItems: [
        {
          to: '/dashboard/student/examination/today',
          label: "Today's Exam",
          description: "Today's exam schedule, hall & timing",
          icon: Clock,
        },
        {
          to: '/dashboard/student/examination/seating',
          label: 'Seating Plan',
          description: 'Exam room layout & allocated desk',
          icon: Armchair,
        },
        {
          to: '/dashboard/student/examination/upcoming',
          label: 'Upcoming Exam',
          description: 'Semester examination routine & timetable',
          icon: CalendarDays,
        },
      ],
    },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white select-none">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight">
          Student Portal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Header */}
            <div className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              {group.groupTitle}
            </div>

            {/* Direct items */}
            {group.items &&
              group.items.map(({ to, label, description, icon: Icon, end }) => (
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
                        'flex w-full items-center gap-3 rounded-[4px] px-3.5 py-2.5 text-sm font-medium transition-colors border',
                        isActive
                          ? 'bg-primary-light text-primary font-semibold border-primary/30'
                          : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      )
                    }
                  >
                    <Icon size={20} className="shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                </Tooltip>
              ))}

            {/* Collapsible examination section */}
            {group.isDropdown && (
              <div className="space-y-1">
                <Tooltip
                  content={group.dropdownDescription}
                  side="right"
                  wrapperClassName="w-full"
                >
                  <button
                    type="button"
                    onClick={() => setIsExamOpen((prev) => !prev)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-[4px] px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer border',
                      isExamActive
                        ? 'bg-primary-light text-primary font-semibold border-primary/30'
                        : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap size={20} className="shrink-0" />
                      <span>{group.dropdownTitle}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'text-gray-400 transition-transform duration-200',
                        isExamOpen && 'rotate-180 text-primary',
                      )}
                    />
                  </button>
                </Tooltip>

                {isExamOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-1 ml-2 border-l border-gray-100 animate-in fade-in duration-150">
                    {group.dropdownItems?.map(
                      ({ to, label, description, icon: SubIcon }) => (
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
                                'flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-xs font-medium transition-colors border',
                                isActive
                                  ? 'bg-primary-light text-primary font-semibold border-primary/30'
                                  : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                              )
                            }
                          >
                            <SubIcon size={16} className="shrink-0" />
                            <span>{label}</span>
                          </NavLink>
                        </Tooltip>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Dropdown */}
      <div className="border-t border-gray-200 p-3">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}
