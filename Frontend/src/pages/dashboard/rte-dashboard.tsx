import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sidebar } from '@/components/dashboard/sidebar';
import { selectCurrentUser } from '@/redux/userSlice';

export default function RteDashboard() {
  const user = useSelector(selectCurrentUser);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'RTE') {
    const dest =
      user.role === 'STUDENT_SERVICE' ? '/dashboard/student-service' : '/';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
