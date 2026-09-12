import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  UserPen,
  LogOut,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  clearCredentials,
  selectCurrentUser,
  setCredentials,
  selectAccessToken,
  selectRefreshToken,
} from '@/redux/userSlice';

export function SidebarUserMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken) || '';
  const refreshToken = useSelector(selectRefreshToken) || '';

  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Edit profile form state
  const [name, setName] = useState(
    user?.email ? user.email.split('@')[0] : 'Admin User',
  );
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        email: email.trim(),
      };
      dispatch(
        setCredentials({
          user: updatedUser,
          accessToken,
          refreshToken,
        }),
      );
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditModalOpen(false);
    }, 1200);
  };

  const userEmail = user?.email || 'admin@islingtoncollege.com';
  const displayName =
    user?.email?.split('@')[0] ||
    (user?.role === 'RTE' ? 'RTE Officer' : 'SS Admin');

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-all duration-200 cursor-pointer select-none',
          isOpen ? 'bg-gray-100' : 'hover:bg-gray-50',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-400">
          <UserIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate mt-0.5">
            {userEmail}
          </div>
        </div>
      </button>

      {/* Upward Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50 divide-y divide-gray-100">
          {/* User Info Header */}
          <div className="px-3 py-2">
            <div className="text-xs font-semibold text-gray-900 truncate">
              {displayName}
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {userEmail}
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsEditModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <UserPen size={15} className="text-gray-500" />
              Edit Profile
            </button>
          </div>

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

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        description="Update your personal account details and credentials."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={16} />
              Profile details updated successfully!
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Name / Display Name</Label>
            <div className="relative">
              <UserIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 h-11"
                placeholder="Enter display name"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email Address</Label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11"
                placeholder="your.email@islingtoncollege.com"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Change Password (Optional)
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-current-pw">Current Password</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="profile-current-pw"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-9 h-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-new-pw">New Password</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="profile-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9 h-11"
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
