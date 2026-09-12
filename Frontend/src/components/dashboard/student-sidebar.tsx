import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ChevronDown,
  Clock,
  Armchair,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { SidebarUserMenu } from '@/components/dashboard/sidebar-user-menu';
import { useSidebar } from '@/context/sidebar-context';

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
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isExamActive =
    location.pathname.startsWith('/dashboard/student/examination') ||
    location.pathname === '/dashboard/student/seating';

  const [isExamOpen, setIsExamOpen] = useState(isExamActive);
  const [isCollapsedExamFlyoutOpen, setIsCollapsedExamFlyoutOpen] =
    useState(false);
  const examFlyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExamActive) {
      setIsExamOpen(true);
    }
  }, [isExamActive]);

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        examFlyoutRef.current &&
        !examFlyoutRef.current.contains(e.target as Node)
      ) {
        setIsCollapsedExamFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          to: '/dashboard/student/analytics',
          label: 'Analytics',
          description: 'Historical GPA & performance trends',
          icon: TrendingUp,
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
            Student Portal
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
          'flex-1 py-4 space-y-3 overflow-y-auto overflow-x-hidden transition-all duration-300',
          isCollapsed ? 'px-2.5' : 'px-3',
        )}
      >
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Header or Divider */}
            {isCollapsed ? (
              idx > 0 && <div className="my-2 border-t border-gray-100" />
            ) : (
              <div className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {group.groupTitle}
              </div>
            )}

            {/* Direct items */}
            {group.items &&
              group.items.map(({ to, label, description, icon: Icon, end }) => (
                <Tooltip
                  key={to}
                  content={
                    isCollapsed ? (
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-[10px] text-gray-300">
                          {description}
                        </div>
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
                        'flex w-full items-center rounded-[4px] text-sm font-medium transition-colors border',
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'gap-3 px-3.5 py-2.5',
                        isActive
                          ? 'bg-primary-light text-primary font-semibold border-primary/30'
                          : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      )
                    }
                  >
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                </Tooltip>
              ))}

            {/* Collapsible examination section */}
            {group.isDropdown && (
              <div className="space-y-1">
                {isCollapsed ? (
                  <div className="relative" ref={examFlyoutRef}>
                    <Tooltip
                      content={
                        <div>
                          <div className="font-semibold">
                            {group.dropdownTitle}
                          </div>
                          <div className="text-[10px] text-gray-300">
                            {group.dropdownDescription}
                          </div>
                        </div>
                      }
                      side="right"
                      wrapperClassName="w-full"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setIsCollapsedExamFlyoutOpen((prev) => !prev)
                        }
                        className={cn(
                          'flex w-full items-center justify-center rounded-[4px] p-2.5 text-sm font-medium transition-colors cursor-pointer border',
                          isExamActive
                            ? 'bg-primary-light text-primary font-semibold border-primary/30'
                            : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )}
                        aria-label="Examination menu"
                      >
                        <GraduationCap size={20} className="shrink-0" />
                      </button>
                    </Tooltip>

                    {/* Flyout Popover in Collapsed mode */}
                    {isCollapsedExamFlyoutOpen && (
                      <div className="absolute left-full top-0 ml-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-mono uppercase font-bold text-gray-400 border-b border-gray-100">
                          {group.dropdownTitle}
                        </div>
                        {group.dropdownItems?.map(
                          ({ to, label, icon: SubIcon }) => (
                            <NavLink
                              key={to}
                              to={to}
                              onClick={() =>
                                setIsCollapsedExamFlyoutOpen(false)
                              }
                              className={({ isActive }) =>
                                cn(
                                  'flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-xs font-medium transition-colors',
                                  isActive
                                    ? 'bg-primary-light text-primary font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                                )
                              }
                            >
                              <SubIcon size={15} className="shrink-0" />
                              <span>{label}</span>
                            </NavLink>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
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
                                    'flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-xs font-medium transition-colors',
                                    isActive
                                      ? 'text-primary font-semibold'
                                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
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
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Dropdown */}
      <div className="border-t border-gray-200 p-2.5">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}
