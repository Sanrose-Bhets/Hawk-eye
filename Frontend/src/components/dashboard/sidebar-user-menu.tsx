import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { clearCredentials, selectCurrentUser } from '@/redux/userSlice';
import { useSidebar } from '@/context/sidebar-context';
import { Tooltip } from '@/components/ui/tooltip';

export function SidebarUserMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const { isCollapsed } = useSidebar();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const isStudent =
    user?.role === 'STUDENT' ||
    location.pathname.startsWith('/dashboard/student');

  const isStudentService = user?.role === 'STUDENT_SERVICE';

  const userEmail = user?.email || 'admin@islingtoncollege.com';
  const displayName =
    user?.email?.split('@')[0] ||
    (user?.role === 'RTE' ? 'RTE Officer' : 'SS Admin');

  const triggerButton = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex w-full items-center rounded-2xl transition-all duration-200 cursor-pointer select-none',
        isCollapsed ? 'justify-center p-2' : 'gap-3 p-2 text-left',
        isOpen ? 'bg-gray-100' : 'hover:bg-gray-50',
      )}
      aria-label="User menu"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-500">
        <UserIcon size={18} />
      </div>
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate mt-0.5">
            {userEmail}
          </div>
        </div>
      )}
    </button>
  );

  return (
    <div className="relative" ref={menuRef}>
      {isCollapsed ? (
        <Tooltip
          content={`Account: ${displayName}`}
          side="right"
          wrapperClassName="w-full"
        >
          {triggerButton}
        </Tooltip>
      ) : (
        triggerButton
      )}

      {/* Upward Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full mb-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50 divide-y divide-gray-100',
            isCollapsed ? 'left-0 w-60' : 'left-0 right-0',
          )}
        >
          {/* User Info Header */}
          <div className="px-3 py-2">
            <div className="text-xs font-semibold text-gray-900 truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {userEmail}
            </div>
          </div>

          {/* Student Profile Link */}
          {isStudent && !isStudentService && (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/student/profile');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <UserIcon size={15} className="text-gray-500" />
                My Profile
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut size={15} className="text-red-500" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
