import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LayoutGrid, GraduationCap, Award, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { clearCredentials } from '@/redux/userSlice';

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
];

export function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-sm">
          RTE
        </div>
        <div>
          <span className="text-base font-semibold text-gray-900 block leading-tight">
            RTE Dashboard
          </span>
          <span className="text-xs text-gray-500 font-medium">Portal</span>
        </div>
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
        <Tooltip
          content="Sign out of your account"
          side="right"
          wrapperClassName="w-full"
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            Logout
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

export const RteSidebar = Sidebar;
