import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StudentServiceSidebar } from '@/components/dashboard/student-service-sidebar';
import { selectCurrentUser } from '@/redux/userSlice';

export default function StudentServiceDashboard() {
  const user = useSelector(selectCurrentUser);

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'STUDENT_SERVICE') {
    const dest = user.role === 'RTE' ? '/dashboard/rte/floor-plans' : '/';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentServiceSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
