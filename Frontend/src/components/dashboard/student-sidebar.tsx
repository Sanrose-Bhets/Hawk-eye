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
  FileText,
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
        {
          to: '/dashboard/student/examination/admit-card',
          label: 'Admit Card',
          description: 'View and download your admit card',
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col ios26-sidebar-glass select-none transition-all duration-300 ease-in-out shrink-0 z-30',
        isCollapsed ? 'w-[72px]' : 'w-64',
      )}
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'border-b border-white/60 bg-white/20 backdrop-blur-md flex items-center transition-all duration-300',
          isCollapsed
            ? 'px-3 py-4 justify-center'
            : 'px-4.5 py-4 justify-between',
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center min-w-0 pr-2">
            <h1 className="text-xl font-bold text-[#16A34A] tracking-tight leading-none whitespace-nowrap">
              Student Portal
            </h1>
          </div>
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
            className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white/60 border border-transparent hover:border-white/80 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          'flex-1 py-3.5 space-y-3 overflow-y-auto overflow-x-hidden transition-all duration-300',
          isCollapsed ? 'px-2' : 'px-3',
        )}
      >
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Header or Divider */}
            {isCollapsed ? (
              idx > 0 && <div className="my-2 border-t border-black/[0.04]" />
            ) : (
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
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
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white tracking-tight">
                          {label}
                        </div>
                        <div className="text-[10px] text-emerald-300/80">
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
                        'flex w-full items-center rounded-xl text-xs font-medium transition-all duration-150 border',
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'gap-3 px-3 py-2.5',
                        isActive
                          ? 'ios26-glass-active text-[#16A34A] font-semibold shadow-[0_4px_16px_0_rgba(22,163,74,0.10),inset_0_1px_1px_0_rgba(255,255,255,0.95)]'
                          : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-white/70 hover:text-gray-900 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
                      )
                    }
                  >
                    <Icon
                      size={18}
                      className={cn('shrink-0 transition-colors')}
                    />
                    {!isCollapsed && (
                      <span className="truncate tracking-tight">{label}</span>
                    )}
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
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white tracking-tight">
                            {group.dropdownTitle}
                          </div>
                          <div className="text-[10px] text-emerald-300/80">
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
                          'flex w-full items-center justify-center rounded-xl p-2.5 text-xs font-medium transition-all duration-150 cursor-pointer border',
                          isExamActive
                            ? 'ios26-glass-active text-[#16A34A] font-semibold shadow-[0_4px_16px_0_rgba(22,163,74,0.10),inset_0_1px_1px_0_rgba(255,255,255,0.95)]'
                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-white/70 hover:text-gray-900',
                        )}
                        aria-label="Examination menu"
                      >
                        <GraduationCap size={18} className="shrink-0" />
                      </button>
                    </Tooltip>

                    {/* Flyout Popover in Collapsed mode */}
                    {isCollapsedExamFlyoutOpen && (
                      <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl border border-white/85 bg-white/80 backdrop-blur-3xl p-2 shadow-[0_16px_48px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.95)] z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-black/[0.04]">
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
                                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                                  isActive
                                    ? 'text-[#16A34A] font-semibold'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60',
                                )
                              }
                            >
                              <SubIcon size={15} className="shrink-0" />
                              <span className="tracking-tight">{label}</span>
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
                          'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 cursor-pointer border',
                          isExamActive
                            ? 'ios26-glass-active text-[#16A34A] font-semibold shadow-[0_4px_16px_0_rgba(22,163,74,0.10),inset_0_1px_1px_0_rgba(255,255,255,0.95)]'
                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-white/70 hover:text-gray-900 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap size={18} className="shrink-0" />
                          <span className="tracking-tight">
                            {group.dropdownTitle}
                          </span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={cn(
                            'text-gray-400 transition-transform duration-200',
                            isExamOpen && 'rotate-180 text-[#16A34A]',
                          )}
                        />
                      </button>
                    </Tooltip>

                    {isExamOpen && (
                      <div className="pl-3.5 pr-1 py-1 space-y-1 ml-2.5 border-l border-white/60 animate-in fade-in duration-150">
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
                                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                                    isActive
                                      ? 'text-[#16A34A] font-semibold'
                                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/40',
                                  )
                                }
                              >
                                <SubIcon size={15} className="shrink-0" />
                                <span className="tracking-tight">{label}</span>
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
      <div className="border-t border-white/60 bg-white/20 backdrop-blur-md p-2.5">
        <SidebarUserMenu />
      </div>
    </aside>
  );
}
